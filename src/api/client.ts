/**
 * Centralized API Client for Boss URL Shortener SaaS
 * Same-origin API calls with Bearer/Session token authentication,
 * timeout handling, and type-safe response parsing.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status?: 'active' | 'disabled' | 'inactive';
  plan: 'free' | 'pro' | 'enterprise' | 'inactive';
  quotaLimit: number;
  quotaUsed: number;
  createdAt: string;
}

export interface LinkItem {
  id: string;
  userId: string;
  userEmail?: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  stage1Id?: number;
  stage1Code?: string;
  stage1Url?: string;
  vpsStage1Url?: string;
  finalUrl?: string;
  status: 'completed' | 'pending' | 'failed' | 'expired';
  clicks: number;
  customDomain?: string;
  password?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ClickLog {
  id: string;
  linkId: string;
  timestamp: string;
  referer: string;
  userAgent: string;
  ip: string;
  browser?: string;
  device?: string;
}

export interface AnalyticsData {
  totalLinks: number;
  totalClicks: number;
  recentClicks: ClickLog[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number; other: number };
  topReferrers: { referer: string; count: number }[];
}

export interface DomainItem {
  id: string;
  userId: string;
  userEmail?: string;
  domain: string;
  intendedUse?: string;
  status: 'pending' | 'approved' | 'rejected' | 'verification_required' | 'verified';
  adminNotes?: string;
  verificationToken: string;
  dnsRecord: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AbuseReport {
  id: string;
  linkId: string;
  shortCode?: string;
  reason: string;
  reporterEmail: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class BossApiClient {
  private baseUrl: string = '/api';
  private fallbackWorkerUrl: string = 'https://boss-url.steep-satellite.workers.dev/api';
  private sessionToken: string | null = null;

  constructor() {
    this.sessionToken = typeof window !== 'undefined' ? localStorage.getItem('boss_session_token') : null;
  }

  public setToken(token: string | null) {
    this.sessionToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('boss_session_token', token);
      } else {
        localStorage.removeItem('boss_session_token');
      }
    }
  }

  public getToken(): string | null {
    return this.sessionToken;
  }

  private getApiBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      // On static hosting providers without local Express backend, route API requests to live Cloudflare Worker
      if (
        host.endsWith('.vercel.app') ||
        host.endsWith('.netlify.app') ||
        host.endsWith('.github.io') ||
        host.endsWith('.surge.sh') ||
        host.endsWith('.render.com')
      ) {
        return this.fallbackWorkerUrl;
      }
    }
    return this.baseUrl;
  }

  private async getFreshToken(): Promise<string | null> {
    try {
      // Dynamically import auth to prevent circular dependency
      const { auth } = await import('../firebase.ts');
      if (auth.currentUser) {
        const freshToken = await auth.currentUser.getIdToken();
        this.sessionToken = freshToken;
        return freshToken;
      }
    } catch (e) {
      // Fallback to stored token
    }
    return this.sessionToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const activeBaseUrl = this.getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${activeBaseUrl}${cleanEndpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const token = await this.getFreshToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-session-id'] = token;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeout);

      const contentType = response.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        // If static host returns 405 Method Not Allowed or 404 on relative /api, retry with live Cloudflare Worker
        if ((response.status === 405 || response.status === 404) && !isRetry && activeBaseUrl === '/api') {
          this.baseUrl = this.fallbackWorkerUrl;
          return this.request<T>(endpoint, options, true);
        }

        if (response.status === 401) {
          // Token expired or invalid
          this.setToken(null);
        }
        throw new ApiError(data.error || data.message || `Request failed with status ${response.status}`, response.status);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new ApiError('Request timed out. Please check network connection.', 408);
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err.message || 'Network request failed', 0);
    }
  }

  // Health and readiness
  public async getHealth() {
    return this.request<{ status: string; app: string; vpsHealthy: boolean; vpsStatus?: string; timestamp: string }>('/health');
  }

  public async getReady() {
    return this.request<{ ready: boolean; vpsReady: boolean; database: string; timestamp: string }>('/ready');
  }

  // Authentication
  public async signup(payload: { email: string; password: string; name: string }) {
    const res = await this.request<{ user: User; sessionToken: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.sessionToken);
    return res;
  }

  public async login(payload: { email: string; password: string }) {
    const res = await this.request<{ user: User; sessionToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.sessionToken);
    return res;
  }

  public async adminLogin(payload: { email?: string; username?: string; password: string }) {
    const res = await this.request<{ user: User; sessionToken: string }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.sessionToken);
    return res;
  }

  public async logout() {
    try {
      await this.request<{ success: boolean }>('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  public async me() {
    return this.request<{ user: User }>('/auth/me');
  }

  // Links
  public async getLinks(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<{ links: LinkItem[] }>(`/links${query}`);
  }

  public async createLink(payload: {
    originalUrl: string;
    customCode?: string;
    customDomain?: string;
    password?: string;
    expiresAt?: string;
  }) {
    return this.request<{ link: LinkItem; message: string }>('/links', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async resolveLink(code: string) {
    return this.request<{ success: boolean; originalUrl?: string; error?: string }>(`/links/resolve/${code}`);
  }

  public async deleteLink(id: string) {
    return this.request<{ success: boolean }>(`/links/${id}`, {
      method: 'DELETE'
    });
  }

  // Analytics
  public async getAnalytics() {
    return this.request<AnalyticsData>('/analytics');
  }

  // Custom Domains
  public async getDomains() {
    return this.request<{ domains: DomainItem[] }>('/domains');
  }

  public async addDomain(payload: { domain: string; intendedUse?: string }) {
    return this.request<{ domain: DomainItem }>('/domains', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async verifyDomain(id: string) {
    return this.request<{ domain: DomainItem; verified: boolean; message: string }>(`/domains/${id}/verify`, {
      method: 'POST'
    });
  }

  // Abuse reporting
  public async reportAbuse(payload: { linkId?: string; shortCode?: string; reason: string; reporterEmail: string }) {
    return this.request<{ success: boolean; message: string }>('/abuse', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Admin routes (Requires role: 'admin')
  public async getAdminStats() {
    return this.request<{
      totalUsers: number;
      activeUsers: number;
      disabledUsers: number;
      totalLinks: number;
      completedLinks: number;
      pendingLinks: number;
      failedLinks: number;
      totalClicks: number;
      pendingDomainsCount: number;
      abuseReportsCount: number;
      vpsHealthy: boolean;
      vpsStatus: string;
      vpsResponseTimeMs: number;
      databaseReady: boolean;
      storageReady: boolean;
    }>('/admin/stats');
  }

  public async getAdminUsers() {
    return this.request<{ users: User[] }>('/admin/users');
  }

  public async updateAdminUser(userId: string, updates: { role?: 'admin' | 'user'; plan?: 'free' | 'pro' | 'enterprise'; status?: 'active' | 'disabled'; quotaLimit?: number }) {
    return this.request<{ user: User }>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  public async getAdminLinks() {
    return this.request<{ links: LinkItem[] }>('/admin/links');
  }

  public async deleteAdminLink(id: string) {
    return this.request<{ success: boolean }>(`/admin/links/${id}`, {
      method: 'DELETE'
    });
  }

  public async getAdminDomains() {
    return this.request<{ domains: DomainItem[] }>('/admin/domains');
  }

  public async updateAdminDomain(id: string, updates: { status: 'approved' | 'rejected' | 'verification_required' | 'verified'; adminNotes?: string }) {
    return this.request<{ domain: DomainItem }>(`/admin/domains/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  public async getAdminApiHealth() {
    return this.request<{
      vpsOnline: boolean;
      lastCheckTime: string;
      httpStatus: number;
      responseTimeMs: number;
      healthData: any;
      readyData: any;
      databaseReady: boolean;
      storageReady: boolean;
      recentFailures: any[];
    }>('/admin/api-health');
  }

  public async getAdminAbuseReports() {
    return this.request<{ reports: AbuseReport[] }>('/admin/abuse');
  }
}

export const api = new BossApiClient();
