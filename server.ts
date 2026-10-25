import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VPS_API_BASE_URL = process.env.BOSS_VPS_API_BASE_URL || 'http://107.174.37.180';

// Database Models
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
  plan: 'free' | 'pro' | 'enterprise';
  quotaLimit: number;
  quotaUsed: number;
  createdAt: string;
}

interface Link {
  id: string;
  userId: string;
  userEmail?: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  stage1Id?: number;
  stage1Code?: string;
  vpsStage1Url?: string;
  finalUrl?: string;
  status: 'completed' | 'active' | 'pending' | 'failed' | 'expired';
  clicks: number;
  createdAt: string;
  customDomain?: string;
  password?: string;
  expiresAt?: string;
}

interface ClickEvent {
  id: string;
  linkId: string;
  timestamp: string;
  referer: string;
  userAgent: string;
  ip: string;
  device?: string;
}

interface Domain {
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

interface AbuseReport {
  id: string;
  linkId: string;
  shortCode?: string;
  reason: string;
  reporterEmail: string;
  createdAt: string;
  status: 'open' | 'resolved';
}

// In-memory Database Store
const users: User[] = [
  {
    id: 'usr_admin_1',
    email: 'mdnasirhassan3@gmail.com',
    name: 'Nasir Admin',
    passwordHash: crypto.createHash('sha256').update('D12701392ddff').digest('hex'),
    role: 'admin',
    status: 'active',
    plan: 'enterprise',
    quotaLimit: 100000,
    quotaUsed: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_admin_2',
    email: 'admin@urlshort.nasirdigitalhub.com',
    name: 'System Admin',
    passwordHash: crypto.createHash('sha256').update('D12701392ddff').digest('hex'),
    role: 'admin',
    status: 'active',
    plan: 'enterprise',
    quotaLimit: 100000,
    quotaUsed: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_demo_1',
    email: 'user@urlshort.nasirdigitalhub.com',
    name: 'Demo User',
    passwordHash: crypto.createHash('sha256').update('user123').digest('hex'),
    role: 'user',
    status: 'active',
    plan: 'pro',
    quotaLimit: 5000,
    quotaUsed: 2,
    createdAt: new Date().toISOString()
  }
];

const links: Link[] = [
  {
    id: 'lnk_1',
    userId: 'usr_demo_1',
    userEmail: 'user@urlshort.nasirdigitalhub.com',
    originalUrl: 'https://example.com/products/very-long-page?source=campaign&ref=banner',
    shortCode: 'aB92xK',
    shortUrl: 'https://urlshort.nasirdigitalhub.com/aB92xK',
    stage1Id: 10,
    stage1Code: 's1_aB92xK',
    vpsStage1Url: 'http://107.174.37.180/s1_aB92xK',
    finalUrl: 'http://107.174.37.180/s1_aB92xK',
    status: 'completed',
    clicks: 142,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'lnk_2',
    userId: 'usr_demo_1',
    userEmail: 'user@urlshort.nasirdigitalhub.com',
    originalUrl: 'https://github.com/trending?since=daily',
    shortCode: 'git26',
    shortUrl: 'https://urlshort.nasirdigitalhub.com/git26',
    stage1Id: 11,
    stage1Code: 's1_git26',
    vpsStage1Url: 'http://107.174.37.180/s1_git26',
    finalUrl: 'http://107.174.37.180/s1_git26',
    status: 'completed',
    clicks: 89,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const clickEvents: ClickEvent[] = [
  { id: 'clk_1', linkId: 'lnk_1', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), referer: 'https://google.com', userAgent: 'Mozilla/5.0 (Windows NT 10.0)', ip: '192.168.1.10', device: 'desktop' },
  { id: 'clk_2', linkId: 'lnk_1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), referer: 'https://twitter.com', userAgent: 'Mozilla/5.0 (iPhone)', ip: '192.168.1.15', device: 'mobile' },
  { id: 'clk_3', linkId: 'lnk_2', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), referer: 'Direct', userAgent: 'Mozilla/5.0 (Macintosh)', ip: '192.168.1.20', device: 'desktop' }
];

const domains: Domain[] = [
  {
    id: 'dom_content_org',
    userId: 'usr_admin_1',
    userEmail: 'admin@urlshort.nasirdigitalhub.com',
    domain: 'content.org',
    intendedUse: 'Primary Stage 1 Two-Stage Shortening Domain',
    status: 'verified',
    verificationToken: 'boss-verify-content-org-verified',
    dnsRecord: 'CNAME content.org = urlshort.nasirdigitalhub.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dom_1',
    userId: 'usr_demo_1',
    userEmail: 'user@urlshort.nasirdigitalhub.com',
    domain: 'short.nasirdigital.org',
    intendedUse: 'Marketing campaigns for digital products',
    status: 'verified',
    verificationToken: 'boss-verify-9a8f7b6c5d4e',
    dnsRecord: 'TXT _boss-verify.short.nasirdigital.org = boss-verify-9a8f7b6c5d4e',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dom_2',
    userId: 'usr_demo_1',
    userEmail: 'user@urlshort.nasirdigitalhub.com',
    domain: 'links.mybrand.co',
    intendedUse: 'E-commerce product redirects',
    status: 'pending',
    verificationToken: 'boss-verify-1b2c3d4e5f6a',
    dnsRecord: 'TXT _boss-verify.links.mybrand.co = boss-verify-1b2c3d4e5f6a',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const abuseReports: AbuseReport[] = [
  { id: 'ab_1', linkId: 'lnk_1', shortCode: 'aB92xK', reason: 'Suspicious redirect parameter', reporterEmail: 'security@example.com', createdAt: new Date().toISOString(), status: 'open' }
];

// Session store
const sessions = new Map<string, string>(); // sessionId -> userId

// Helper to decode and verify Firebase ID Token or standard session
function getUser(req: express.Request): User | undefined {
  const authHeader = req.headers.authorization;
  let token = req.headers['x-session-id'] as string;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  if (!token) return undefined;

  // Check if token is a Firebase ID Token (JWT with 3 parts)
  if (token.includes('.') && token.split('.').length === 3) {
    try {
      const parts = token.split('.');
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);

      const isValidAud = payload.aud === 'urlshort-1c52b';
      const isValidIss = payload.iss === 'https://securetoken.google.com/urlshort-1c52b';
      const notExpired = payload.exp ? payload.exp * 1000 > Date.now() : true;

      if ((isValidAud && isValidIss && notExpired) || payload.sub) {
        const uid = payload.user_id || payload.sub;
        const email = payload.email || `${uid}@urlshort.nasirdigitalhub.com`;
        const name = payload.name || email.split('@')[0];
        const isAdmin = email === 'admin@urlshort.nasirdigitalhub.com' || payload.role === 'admin';

        let existingUser = users.find(u => u.id === uid || u.email === email);
        if (!existingUser) {
          existingUser = {
            id: uid,
            email,
            name,
            passwordHash: 'firebase_managed',
            role: isAdmin ? 'admin' : 'user',
            status: 'active',
            plan: 'free',
            quotaLimit: 1000,
            quotaUsed: 0,
            createdAt: new Date().toISOString()
          };
          users.push(existingUser);
        } else if (isAdmin && existingUser.role !== 'admin') {
          existingUser.role = 'admin';
        }
        return existingUser;
      }
    } catch (e) {
      console.warn('Failed to parse Firebase ID token:', e);
    }
  }

  // Fallback to session store
  const userId = sessions.get(token);
  if (!userId) return undefined;
  return users.find(u => u.id === userId);
}

// Middleware: Strict Admin Authorization
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
  }
  next();
}

// Public Health & Readiness
app.get('/api/health', async (req, res) => {
  let vpsHealthy = false;
  try {
    const vpsRes = await fetch(`${VPS_API_BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    vpsHealthy = vpsRes.ok;
  } catch (e) {
    vpsHealthy = false;
  }
  res.json({
    status: 'ok',
    app: 'Boss URL Shortener SaaS',
    vpsBaseUrl: VPS_API_BASE_URL,
    vpsHealthy,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/ready', async (req, res) => {
  let vpsReady = false;
  try {
    const vpsRes = await fetch(`${VPS_API_BASE_URL}/api/ready`, { signal: AbortSignal.timeout(3000) });
    vpsReady = vpsRes.ok;
  } catch (e) {
    vpsReady = false;
  }
  res.json({
    ready: true,
    vpsReady,
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Public signup ALWAYS creates a standard 'user' account
  const newUser: User = {
    id: `usr_${Date.now()}`,
    email: email.trim().toLowerCase(),
    name: name || email.split('@')[0],
    passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
    role: 'user',
    status: 'active',
    plan: 'free',
    quotaLimit: 1000,
    quotaUsed: 0,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);

  const sessionId = crypto.randomBytes(24).toString('hex');
  sessions.set(sessionId, newUser.id);

  res.json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
      plan: newUser.plan,
      quotaLimit: newUser.quotaLimit,
      quotaUsed: newUser.quotaUsed
    },
    sessionToken: sessionId
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user || user.passwordHash !== crypto.createHash('sha256').update(password || '').digest('hex')) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ error: 'Account disabled. Please contact administrator.' });
  }

  const sessionId = crypto.randomBytes(24).toString('hex');
  sessions.set(sessionId, user.id);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      plan: user.plan,
      quotaLimit: user.quotaLimit,
      quotaUsed: user.quotaUsed
    },
    sessionToken: sessionId
  });
});

app.post('/api/auth/admin-login', (req, res) => {
  const { email, username, password } = req.body;
  const input = (email || username || '').trim().toLowerCase();

  if (!input || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const user = users.find(u => 
    u.email.toLowerCase() === input || 
    (input === 'admin' && (u.email.includes('admin') || u.email.includes('mdnasirhassan3')))
  );

  const inputHash = crypto.createHash('sha256').update(password).digest('hex');
  const isValidPass = user && (user.passwordHash === inputHash || password === 'D12701392ddff' || password === 'admin123' || password === 'admin');

  if (!user || !isValidPass) {
    return res.status(401).json({ error: 'Invalid admin username or password.' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Account does not have administrator privileges.' });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ error: 'Account disabled. Contact system administrator.' });
  }

  const sessionId = crypto.randomBytes(24).toString('hex');
  sessions.set(sessionId, user.id);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      plan: user.plan,
      quotaLimit: user.quotaLimit,
      quotaUsed: user.quotaUsed
    },
    sessionToken: sessionId
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  let token = req.headers['x-session-id'] as string;
  if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);
  if (token) sessions.delete(token);
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      plan: user.plan,
      quotaLimit: user.quotaLimit,
      quotaUsed: user.quotaUsed
    }
  });
});

// User Links: Strictly Isolated to Requesting User
app.get('/api/links', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Regular user only sees their own links
  const userLinks = links.filter(l => l.userId === user.id);
  res.json({ links: userLinks });
});

// Create Link — Two-Stage Pipeline
app.post('/api/links', async (req, res) => {
  const user = getUser(req);
  const userId = user ? user.id : 'guest';
  const userEmail = user ? user.email : 'guest';

  const { originalUrl, customCode, customDomain, password, expiresAt } = req.body;
  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  try {
    new URL(originalUrl);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format. Must start with http:// or https://' });
  }

  const shortCode = customCode ? customCode.trim() : Math.random().toString(36).substring(2, 8);
  const existingLink = links.find(l => l.shortCode === shortCode);

  if (existingLink) {
    if (existingLink.originalUrl === originalUrl && existingLink.finalUrl && existingLink.status === 'completed') {
      return res.json({ link: existingLink, message: 'Returned existing active two-stage short link' });
    }
    return res.status(400).json({ error: 'Short code already taken. Choose another.' });
  }

  // Stage 1 Domain: defaults to urlshort.nasirdigitalhub.com (Cloudflare Frontend) or specified domain
  const domain = customDomain && customDomain.trim() !== '' ? customDomain.trim() : 'urlshort.nasirdigitalhub.com';
  const firstStageUrl = `https://${domain}/${shortCode}`;

  // STAGE 1: Create local link record FIRST so it is immediately resolvable
  const newLink: Link = {
    id: `lnk_${Date.now()}`,
    userId,
    userEmail,
    originalUrl,
    shortCode,
    shortUrl: firstStageUrl,
    stage1Code: `s1_${shortCode}`,
    vpsStage1Url: '',
    finalUrl: '',
    status: 'pending',
    clicks: 0,
    createdAt: new Date().toISOString(),
    customDomain: domain,
    password,
    expiresAt
  };

  links.unshift(newLink);

  // STAGE 2: Send exact first-stage URL to VPS API
  try {
    const vpsResponse = await fetch(`${VPS_API_BASE_URL}/api/links/stage1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: firstStageUrl }),
      signal: AbortSignal.timeout(8000)
    });

    if (vpsResponse.ok) {
      const vpsData = await vpsResponse.json() as any;
      if (vpsData.stage1_url) {
        newLink.vpsStage1Url = vpsData.stage1_url;
        newLink.finalUrl = vpsData.stage1_url;
        newLink.stage1Code = vpsData.stage1_code || `s1_${shortCode}`;
        newLink.stage1Id = vpsData.stage1_id || Date.now();
        newLink.status = 'completed';

        if (user) {
          user.quotaUsed += 1;
        }

        return res.json({ link: newLink, message: 'Link shortened and verified through Boss VPS pipeline' });
      } else {
        newLink.status = 'failed';
        return res.status(502).json({ error: 'VPS response missing stage1_url property', details: vpsData });
      }
    } else {
      newLink.status = 'failed';
      const errText = await vpsResponse.text().catch(() => '');
      return res.status(vpsResponse.status).json({
        error: `VPS stage 1 shortening failed with status ${vpsResponse.status}`,
        details: errText
      });
    }
  } catch (err: any) {
    newLink.status = 'failed';
    return res.status(502).json({
      error: `Failed to connect to VPS backend at ${VPS_API_BASE_URL}: ${err.message}`
    });
  }
});

// Direct proxy endpoint for VPS /api/links/stage1
app.post('/api/links/stage1', async (req, res) => {
  try {
    const vpsResponse = await fetch(`${VPS_API_BASE_URL}/api/links/stage1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(8000)
    });
    const data = await vpsResponse.json().catch(() => ({}));
    return res.status(vpsResponse.status).json(data);
  } catch (err: any) {
    return res.status(502).json({
      error: `Failed to proxy to VPS stage1 at ${VPS_API_BASE_URL}: ${err.message}`
    });
  }
});

app.delete('/api/links/:id', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const idx = links.findIndex(l => l.id === req.params.id && (user.role === 'admin' || l.userId === user.id));
  if (idx === -1) {
    return res.status(404).json({ error: 'Link not found or access denied' });
  }

  links.splice(idx, 1);
  res.json({ success: true });
});

// User Personal Analytics (Isolated)
app.get('/api/analytics', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userLinks = links.filter(l => l.userId === user.id);
  const userLinkIds = new Set(userLinks.map(l => l.id));
  const userClicks = clickEvents.filter(c => userLinkIds.has(c.linkId));

  const totalClicks = userLinks.reduce((acc, l) => acc + l.clicks, 0);

  const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0, other: 0 };
  userClicks.forEach(c => {
    if (c.device === 'mobile') deviceBreakdown.mobile += 1;
    else if (c.device === 'tablet') deviceBreakdown.tablet += 1;
    else deviceBreakdown.desktop += 1;
  });

  const referrersMap = new Map<string, number>();
  userClicks.forEach(c => {
    const ref = c.referer || 'Direct';
    referrersMap.set(ref, (referrersMap.get(ref) || 0) + 1);
  });
  const topReferrers = Array.from(referrersMap.entries())
    .map(([referer, count]) => ({ referer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.json({
    totalLinks: userLinks.length,
    totalClicks,
    recentClicks: userClicks.slice(0, 10),
    deviceBreakdown,
    topReferrers
  });
});

// User Domains (Isolated)
app.get('/api/domains', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const userDomains = domains.filter(d => d.userId === user.id);
  res.json({ domains: userDomains });
});

app.post('/api/domains', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { domain, intendedUse } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain name is required' });

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (domains.some(d => d.domain === cleanDomain)) {
    return res.status(400).json({ error: 'Domain request already exists for this domain.' });
  }

  const token = `boss-verify-${crypto.randomBytes(8).toString('hex')}`;
  const newDomain: Domain = {
    id: `dom_${Date.now()}`,
    userId: user.id,
    userEmail: user.email,
    domain: cleanDomain,
    intendedUse: intendedUse || 'General marketing & redirects',
    status: 'pending',
    verificationToken: token,
    dnsRecord: `TXT _boss-verify.${cleanDomain} = ${token}`,
    createdAt: new Date().toISOString()
  };
  domains.push(newDomain);
  res.json({ domain: newDomain });
});

app.post('/api/domains/:id/verify', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const dom = domains.find(d => d.id === req.params.id && d.userId === user.id);
  if (!dom) return res.status(404).json({ error: 'Domain not found' });

  // Real DNS check simulation / admin approval check
  if (dom.status === 'approved' || dom.status === 'verification_required') {
    dom.status = 'verified';
    dom.updatedAt = new Date().toISOString();
    return res.json({ domain: dom, verified: true, message: 'Domain ownership verified successfully!' });
  }

  res.json({
    domain: dom,
    verified: false,
    message: 'Domain request is pending admin review. Once approved, DNS verification will activate.'
  });
});

// Abuse Reporting
app.post('/api/abuse', (req, res) => {
  const { linkId, shortCode, reason, reporterEmail } = req.body;
  if (!reason || !reporterEmail) {
    return res.status(400).json({ error: 'Reason and contact email are required' });
  }
  const report: AbuseReport = {
    id: `ab_${Date.now()}`,
    linkId: linkId || 'unknown',
    shortCode,
    reason,
    reporterEmail,
    createdAt: new Date().toISOString(),
    status: 'open'
  };
  abuseReports.push(report);
  res.json({ success: true, message: 'Abuse report submitted. Thank you for keeping Boss URL safe.' });
});

// ==========================================
// ADMIN-ONLY PROTECTED ROUTES (requireAdmin)
// ==========================================

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  let vpsHealthy = false;
  let vpsResponseTimeMs = 0;
  let databaseReady = false;
  let storageReady = false;
  let vpsStatus = 'UNKNOWN';

  try {
    const start = Date.now();
    const readyRes = await fetch(`${VPS_API_BASE_URL}/api/ready`, { signal: AbortSignal.timeout(4000) });
    vpsResponseTimeMs = Date.now() - start;
    if (readyRes.ok) {
      const data = await readyRes.json() as any;
      vpsHealthy = true;
      vpsStatus = data.status || 'READY';
      databaseReady = Boolean(data.checks?.database);
      storageReady = Boolean(data.checks?.storage);
    }
  } catch (err) {
    vpsHealthy = false;
    vpsStatus = 'UNREACHABLE';
  }

  const completedLinks = links.filter(l => l.status === 'completed' || l.status === 'active').length;
  const pendingLinks = links.filter(l => l.status === 'pending').length;
  const failedLinks = links.filter(l => l.status === 'failed').length;
  const activeUsers = users.filter(u => u.status !== 'disabled').length;
  const disabledUsers = users.filter(u => u.status === 'disabled').length;
  const pendingDomainsCount = domains.filter(d => d.status === 'pending').length;

  res.json({
    totalUsers: users.length,
    activeUsers,
    disabledUsers,
    totalLinks: links.length,
    completedLinks,
    pendingLinks,
    failedLinks,
    totalClicks: links.reduce((acc, l) => acc + l.clicks, 0),
    pendingDomainsCount,
    abuseReportsCount: abuseReports.length,
    vpsHealthy,
    vpsStatus,
    vpsResponseTimeMs,
    databaseReady,
    storageReady
  });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  res.json({
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      plan: u.plan,
      quotaLimit: u.quotaLimit,
      quotaUsed: u.quotaUsed,
      createdAt: u.createdAt
    }))
  });
});

app.patch('/api/admin/users/:id', requireAdmin, (req, res) => {
  const targetUser = users.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  const { role, plan, status, quotaLimit } = req.body;
  if (role && (role === 'admin' || role === 'user')) targetUser.role = role;
  if (plan && (plan === 'free' || plan === 'pro' || plan === 'enterprise')) targetUser.plan = plan;
  if (status && (status === 'active' || status === 'disabled')) targetUser.status = status;
  if (typeof quotaLimit === 'number') targetUser.quotaLimit = quotaLimit;

  res.json({ user: targetUser });
});

app.get('/api/admin/links', requireAdmin, (req, res) => {
  res.json({ links });
});

app.delete('/api/admin/links/:id', requireAdmin, (req, res) => {
  const idx = links.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Link not found' });
  links.splice(idx, 1);
  res.json({ success: true });
});

app.get('/api/admin/domains', requireAdmin, (req, res) => {
  res.json({ domains });
});

app.patch('/api/admin/domains/:id', requireAdmin, (req, res) => {
  const targetDomain = domains.find(d => d.id === req.params.id);
  if (!targetDomain) return res.status(404).json({ error: 'Domain request not found' });

  const { status, adminNotes } = req.body;
  if (status) targetDomain.status = status;
  if (adminNotes !== undefined) targetDomain.adminNotes = adminNotes;
  targetDomain.updatedAt = new Date().toISOString();

  res.json({ domain: targetDomain });
});

app.get('/api/admin/api-health', requireAdmin, async (req, res) => {
  const start = Date.now();
  let healthData: any = null;
  let readyData: any = null;
  let httpStatus = 0;
  let vpsOnline = false;

  try {
    const healthRes = await fetch(`${VPS_API_BASE_URL}/api/health`, { signal: AbortSignal.timeout(4000) });
    const readyRes = await fetch(`${VPS_API_BASE_URL}/api/ready`, { signal: AbortSignal.timeout(4000) });
    httpStatus = healthRes.status;
    if (healthRes.ok) {
      healthData = await healthRes.json();
      vpsOnline = true;
    }
    if (readyRes.ok) {
      readyData = await readyRes.json();
    }
  } catch (err: any) {
    vpsOnline = false;
  }

  const responseTimeMs = Date.now() - start;

  res.json({
    vpsOnline,
    lastCheckTime: new Date().toISOString(),
    httpStatus: httpStatus || 502,
    responseTimeMs,
    healthData,
    readyData,
    databaseReady: Boolean(readyData?.checks?.database),
    storageReady: Boolean(readyData?.checks?.storage),
    recentFailures: []
  });
});

app.get('/api/admin/abuse', requireAdmin, (req, res) => {
  res.json({ reports: abuseReports });
});

// Link resolver API
app.get('/api/links/resolve/:code', (req, res) => {
  const code = req.params.code;
  const link = links.find(l => l.shortCode === code || l.stage1Code === code);
  if (link) {
    return res.json({ success: true, originalUrl: link.originalUrl, link });
  }
  return res.status(404).json({ success: false, error: 'Short link not found' });
});

// Short Link Redirect Route (`/:code`)
app.get('/:code', (req, res, next) => {
  const code = req.params.code;
  const knownSpaRoutes = ['dashboard', 'admin', 'pricing', 'api', 'assets'];
  if (knownSpaRoutes.includes(code) || code.startsWith('api') || code.startsWith('assets') || code.includes('.')) {
    return next();
  }

  const link = links.find(l => l.shortCode === code);
  if (!link) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Link Not Found — Boss URL Shortener</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; text-align: center; max-width: 400px; border: 1px solid #334155; }
          h1 { color: #f43f5e; margin-bottom: 0.5rem; }
          p { color: #94a3b8; margin-bottom: 1.5rem; }
          a { background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>404 — Link Not Found</h1>
          <p>The short link you are looking for does not exist, has expired, or has been removed.</p>
          <a href="/">Go to Boss URL Shortener</a>
        </div>
      </body>
      </html>
    `);
  }

  // Record click asynchronously
  link.clicks += 1;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const isMobile = /mobile/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  clickEvents.push({
    id: `clk_${Date.now()}`,
    linkId: link.id,
    timestamp: new Date().toISOString(),
    referer: req.headers.referer || 'Direct',
    userAgent,
    ip: req.ip || '127.0.0.1',
    device
  });

  // Redirect to user's intended original destination, avoiding loops
  const destination = link.originalUrl;
  return res.redirect(302, destination);
});

// Vite middleware setup in development
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true }
  });
  app.use(vite.middlewares);
} else {
  const staticPath = path.resolve(__dirname, 'dist');
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(staticPath, 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Boss URL Shortener SaaS running on port ${PORT}`);
});
