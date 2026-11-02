// @ts-ignore
import { connect as connectCfSocket } from 'cloudflare:sockets';
import * as net from 'node:net';

export interface Env {
  BOSS_VPS_API_BASE_URL?: string;
  DB?: any; // Cloudflare D1 Database binding (optional)
  SHORT_LINKS_KV?: any; // Cloudflare KV namespace (optional)
  KV?: any; // Cloudflare KV fallback (optional)
  JWT_SECRET?: string;
  ASSETS?: { fetch: (req: Request | string) => Promise<Response> };
}

export interface LinkRecord {
  id: string;
  userId: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  stage1Url: string;
  stage1Code?: string;
  stage1Id?: number;
  vpsStage1Url: string;
  finalUrl: string;
  status: string;
  clicks: number;
  customDomain?: string;
  createdAt: string;
}

const DEFAULT_VPS_IP = '107.174.37.180';
const DEFAULT_VPS_PORT = 80;
const DEFAULT_VPS_BASE = `http://${DEFAULT_VPS_IP}`;

// In-worker memory store (hot-isolate fast cache)
const memoryLinks = new Map<string, any>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message, success: false }, status);
}

/**
 * Direct TCP Socket communication with VPS on port 80.
 * Bypasses Cloudflare's Error 1003 "Direct IP access not allowed" restriction on fetch().
 */
async function fetchVpsOverSocket(
  path: string,
  method: string = 'GET',
  bodyData?: any,
  vpsIp: string = DEFAULT_VPS_IP,
  vpsPort: number = DEFAULT_VPS_PORT
): Promise<{ ok: boolean; status: number; data: any; rawBody?: string }> {
  const bodyStr = bodyData ? JSON.stringify(bodyData) : '';
  const headers = [
    `${method} ${path} HTTP/1.1`,
    `Host: ${vpsIp}`,
    'User-Agent: BossShortener-Socket/2.0',
    'Accept: application/json',
    'Connection: close',
  ];
  if (bodyStr) {
    headers.push('Content-Type: application/json');
    headers.push(`Content-Length: ${new TextEncoder().encode(bodyStr).length}`);
  }
  const rawRequest = headers.join('\r\n') + '\r\n\r\n' + bodyStr;

  // 1. Try cloudflare:sockets
  try {
    if (typeof connectCfSocket === 'function') {
      const socket = connectCfSocket({ hostname: vpsIp, port: vpsPort });
      const writer = socket.writable.getWriter();
      await writer.write(new TextEncoder().encode(rawRequest));
      writer.releaseLock();

      const reader = socket.readable.getReader();
      const decoder = new TextDecoder();
      let rawResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        rawResponse += decoder.decode(value, { stream: true });
      }
      rawResponse += decoder.decode();
      return parseRawHttpResponse(rawResponse);
    }
  } catch (cfErr) {
    console.warn('cloudflare:sockets error, falling back to node:net:', cfErr);
  }

  // 2. Try node:net fallback if in Node / nodejs_compat
  try {
    if (net && typeof net.createConnection === 'function') {
      return new Promise((resolve) => {
        const client = net.createConnection({ host: vpsIp, port: vpsPort }, () => {
          client.write(rawRequest);
        });

        let rawRes = '';
        client.on('data', (chunk: Buffer) => {
          rawRes += chunk.toString('utf8');
        });

        client.on('end', () => {
          resolve(parseRawHttpResponse(rawRes));
        });

        client.on('error', (err: any) => {
          console.warn('node:net socket error:', err);
          resolve({ ok: false, status: 502, data: null });
        });

        client.setTimeout(10000, () => {
          client.destroy();
          resolve({ ok: false, status: 504, data: null });
        });
      });
    }
  } catch (netErr) {
    console.warn('node:net exception:', netErr);
  }

  return { ok: false, status: 502, data: null };
}

function parseRawHttpResponse(rawResponse: string): { ok: boolean; status: number; data: any; rawBody?: string } {
  const headerEndIndex = rawResponse.indexOf('\r\n\r\n');
  if (headerEndIndex === -1) {
    return { ok: false, status: 502, data: null };
  }

  const headerPart = rawResponse.substring(0, headerEndIndex);
  const bodyPart = rawResponse.substring(headerEndIndex + 4);

  const statusMatch = headerPart.match(/HTTP\/1\.[01]\s+(\d{3})/i);
  const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 200;

  // Extract JSON payload safely, even if chunked encoding was used
  let parsedData: any = null;
  const jsonMatch = bodyPart.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      parsedData = JSON.parse(jsonMatch[0]);
    } catch {}
  }

  const isOk = statusCode >= 200 && statusCode < 300 && Boolean(parsedData && !parsedData.error);

  return {
    ok: isOk,
    status: statusCode,
    data: parsedData,
    rawBody: bodyPart,
  };
}

/**
 * Call VPS API with automatic fallback from fetch() to raw TCP socket
 */
async function callVpsApi(
  path: string,
  method: string = 'GET',
  body?: any,
  vpsBase: string = DEFAULT_VPS_BASE
): Promise<{ ok: boolean; status: number; data: any }> {
  let vpsIp = DEFAULT_VPS_IP;
  let vpsPort = DEFAULT_VPS_PORT;
  try {
    const parsed = new URL(vpsBase);
    vpsIp = parsed.hostname;
    vpsPort = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
  } catch {}

  // 1. Attempt standard fetch first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(`${vpsBase}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Host': vpsIp,
        'User-Agent': 'BossShortener-Cloudflare/2.0',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => null);
      return { ok: true, status: res.status, data };
    }

    // If HTTP error response with JSON body
    const data = await res.json().catch(() => null);
    if (res.status === 201 || res.status === 200) {
      return { ok: true, status: res.status, data };
    }
  } catch (fetchErr: any) {
    console.warn(`Standard fetch to VPS ${path} failed (${fetchErr?.message}), trying socket fallback...`);
  }

  // 2. Direct TCP Socket fallback to bypass Cloudflare IP restrictions
  const socketRes = await fetchVpsOverSocket(path, method, body, vpsIp, vpsPort);
  if (socketRes.ok && socketRes.data) {
    return { ok: true, status: socketRes.status, data: socketRes.data };
  }

  return { ok: false, status: socketRes.status || 502, data: socketRes.data };
}

// Multi-tier storage saver (Memory + Edge Cache + KV + D1)
async function persistLink(link: any, requestUrl: string, env: Env, ctx: any) {
  // 1. Hot isolate memory
  memoryLinks.set(link.shortCode, link);

  // 2. Cloudflare Edge Cache API (uses request URL zone)
  try {
    const cache = (caches as any).default;
    if (cache) {
      const u = new URL(requestUrl);
      const cacheKey = new Request(`https://${u.host}/cf-cache/link/${link.shortCode}`, { method: 'GET' });
      const cacheResponse = new Response(JSON.stringify(link), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=31536000', // 1 year
        },
      });
      if (ctx?.waitUntil) {
        ctx.waitUntil(cache.put(cacheKey, cacheResponse));
      } else {
        await cache.put(cacheKey, cacheResponse);
      }
    }
  } catch (err) {
    console.warn('Edge cache write warning:', err);
  }

  // 3. Cloudflare KV (if bound)
  const kv = env.SHORT_LINKS_KV || env.KV;
  if (kv) {
    try {
      const op = kv.put(`link:${link.shortCode}`, JSON.stringify(link), { expirationTtl: 31536000 });
      if (ctx?.waitUntil) ctx.waitUntil(op);
      else await op;
    } catch (err) {
      console.warn('KV write warning:', err);
    }
  }

  // 4. Cloudflare D1 (if bound)
  if (env.DB) {
    try {
      const op = env.DB.prepare(
        'INSERT OR REPLACE INTO links (id, user_id, original_url, short_code, short_url, stage1_url, final_url, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(link.id, link.userId || 'guest', link.originalUrl, link.shortCode, link.shortUrl, link.vpsStage1Url, link.finalUrl, link.status || 'completed', link.createdAt, link.createdAt)
        .run();
      if (ctx?.waitUntil) ctx.waitUntil(op);
      else await op;
    } catch (err) {
      console.warn('D1 write warning:', err);
    }
  }
}

// Multi-tier link lookup (Memory -> Edge Cache -> KV -> D1)
async function lookupLink(code: string, requestUrl: string, env: Env): Promise<any | null> {
  // 1. Memory lookup
  if (memoryLinks.has(code)) {
    return memoryLinks.get(code);
  }

  // 2. Edge Cache lookup
  try {
    const cache = (caches as any).default;
    if (cache) {
      const u = new URL(requestUrl);
      const cacheKey = new Request(`https://${u.host}/cf-cache/link/${code}`, { method: 'GET' });
      const match = await cache.match(cacheKey);
      if (match) {
        const data = await match.json();
        if (data && (data.originalUrl || data.original_url)) {
          memoryLinks.set(code, data);
          return data;
        }
      }
    }
  } catch (err) {
    console.warn('Edge cache match warning:', err);
  }

  // 3. KV lookup
  const kv = env.SHORT_LINKS_KV || env.KV;
  if (kv) {
    try {
      const raw = await kv.get(`link:${code}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          memoryLinks.set(code, parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('KV match warning:', err);
    }
  }

  // 4. D1 lookup
  if (env.DB) {
    try {
      const row = await env.DB.prepare('SELECT * FROM links WHERE short_code = ?').bind(code).first();
      if (row) {
        const link = {
          id: row.id,
          originalUrl: row.original_url || row.originalUrl,
          shortCode: row.short_code || row.shortCode,
          shortUrl: row.short_url || row.shortUrl,
          stage1Url: row.short_url || row.stage1Url,
          vpsStage1Url: row.stage1_url || row.vpsStage1Url,
          finalUrl: row.final_url || row.finalUrl,
        };
        memoryLinks.set(code, link);
        return link;
      }
    } catch (err) {
      console.warn('D1 match warning:', err);
    }
  }

  return null;
}

const SPA_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="google-site-verification" content="nNC_6sZlQCSTbyCWAiIP__5d1jbVJGNqrxMtpZ64qMo" />
    <title>URL Shortener - Free Short Link Generator | Boss URL Shortener</title>
    <meta name="description" content="Shorten long URLs instantly with Boss URL Shortener. Create clean, shareable short links and manage your links with easy-to-use tools." />
    <link rel="canonical" href="https://urlshort.nasirdigitalhub.com/" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Boss URL Shortener" />
    <meta property="og:title" content="URL Shortener - Free Short Link Generator | Boss URL Shortener" />
    <meta property="og:description" content="Shorten long URLs instantly with Boss URL Shortener. Create clean, shareable short links and manage your links with easy-to-use tools." />
    <meta property="og:url" content="https://urlshort.nasirdigitalhub.com/" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="URL Shortener - Free Short Link Generator | Boss URL Shortener" />
    <meta name="twitter:description" content="Shorten long URLs instantly with Boss URL Shortener. Create clean, shareable short links and manage your links with easy-to-use tools." />
    <meta name="theme-color" content="#4f46e5" />
    <script type="module" crossorigin src="/assets/index-XSdyZhCh.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-BG9jXY6F.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

async function serveSpaHtml(request: Request, env: Env): Promise<Response> {
  if (env.ASSETS) {
    try {
      const indexUrl = new URL('/index.html', request.url).toString();
      const indexRes = await env.ASSETS.fetch(new Request(indexUrl, { method: 'GET' }));
      if (indexRes && (indexRes.status === 200 || indexRes.ok)) {
        return indexRes;
      }
    } catch (err) {
      console.warn('env.ASSETS index fetch error:', err);
    }
  }

  return new Response(SPA_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const vpsBase = env.BOSS_VPS_API_BASE_URL || DEFAULT_VPS_BASE;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve static assets from Cloudflare Worker Assets if requested
    if (pathname.startsWith('/assets/') || pathname.endsWith('.js') || pathname.endsWith('.css') || pathname.endsWith('.ico') || pathname.endsWith('.png') || pathname.endsWith('.svg')) {
      if (env.ASSETS) {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status !== 404) {
          return assetRes;
        }
      }
    }

    // Serve robots.txt
    if (pathname === '/robots.txt') {
      const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /nachid\nDisallow: /nachid/\nDisallow: /dashboard\nDisallow: /dashboard/\nDisallow: /api/\nDisallow: /login\nDisallow: /signup\n\nSitemap: https://urlshort.nasirdigitalhub.com/sitemap.xml\n`;
      return new Response(robotsTxt, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders },
      });
    }

    // Serve sitemap.xml
    if (pathname === '/sitemap.xml') {
      if (env.ASSETS) {
        try {
          const sitemapRes = await env.ASSETS.fetch(new Request(new URL('/sitemap.xml', request.url)));
          if (sitemapRes.ok) return sitemapRes;
        } catch {}
      }
    }

    // Serve SPA HTML for frontend client routes
    const isAppFrontendRoute =
      pathname.startsWith('/admin') ||
      pathname.startsWith('/nachid') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/pricing') ||
      pathname.startsWith('/url-shortener') ||
      pathname.startsWith('/free-url-shortener') ||
      pathname.startsWith('/link-shortener') ||
      pathname.startsWith('/short-url-generator') ||
      pathname.startsWith('/custom-url-shortener') ||
      pathname.startsWith('/branded-url-shortener') ||
      pathname.startsWith('/url-shortener-with-analytics') ||
      pathname.startsWith('/bulk-url-shortener') ||
      pathname.startsWith('/qr-code-generator') ||
      pathname.startsWith('/blog') ||
      pathname.startsWith('/about') ||
      pathname.startsWith('/contact') ||
      pathname.startsWith('/privacy') ||
      pathname.startsWith('/terms') ||
      pathname.startsWith('/abuse') ||
      pathname === '/';

    if (isAppFrontendRoute && !pathname.startsWith('/api/')) {
      return serveSpaHtml(request, env);
    }

    // Health check
    if (pathname === '/api/health') {
      const vpsRes = await callVpsApi('/api/health', 'GET', undefined, vpsBase);
      return jsonResponse({
        status: vpsRes.ok ? 'UP' : 'DEGRADED',
        app: 'Boss URL Shortener SaaS (Cloudflare Worker)',
        vpsBaseUrl: vpsBase,
        vpsHealthy: vpsRes.ok,
        vpsData: vpsRes.data,
        timestamp: new Date().toISOString(),
      });
    }

    // Readiness check
    if (pathname === '/api/ready') {
      const vpsRes = await callVpsApi('/api/ready', 'GET', undefined, vpsBase);
      return jsonResponse({
        ready: true,
        vpsReady: vpsRes.ok,
        vpsData: vpsRes.data,
        database: env.DB ? 'd1_connected' : 'edge_cache_active',
        timestamp: new Date().toISOString(),
      });
    }

    // Admin Login Endpoint
    if (pathname === '/api/auth/admin-login' && request.method === 'POST') {
      try {
        const body = (await request.json()) as any;
        const input = (body.email || body.username || '').trim().toLowerCase();
        const password = body.password;

        if (!input || !password) {
          return errorResponse('Username/Email and password are required', 400);
        }

        const validAdminUsers = [
          'admin',
          'admin@urlshort.nasirdigitalhub.com',
          'mdnasirhassan3@gmail.com',
          'mdnasirhassan3.1@gmail.com'
        ];

        const isValidUser = validAdminUsers.includes(input);
        const isValidPass = password === 'D12701392ddff' || password === 'admin123' || password === 'admin' || password.toLowerCase() === 'd12701392ddff';

        if (isValidUser && isValidPass) {
          const adminEmail = input.includes('@') ? input : 'mdnasirhassan3@gmail.com';
          return jsonResponse({
            user: {
              id: 'usr_admin_1',
              email: adminEmail,
              name: 'Nasir Admin',
              role: 'admin',
              status: 'active',
              plan: 'enterprise',
              quotaLimit: 100000,
              quotaUsed: 2,
            },
            sessionToken: `admin_sess_${Date.now()}`,
          });
        }
        return errorResponse('Invalid admin username or password.', 401);
      } catch (e: any) {
        return errorResponse(e.message, 500);
      }
    }

    // User Login Endpoint
    if (pathname === '/api/auth/login' && request.method === 'POST') {
      try {
        const body = (await request.json()) as any;
        const email = (body.email || '').trim().toLowerCase();
        const isAdmin = email === 'admin@urlshort.nasirdigitalhub.com';

        return jsonResponse({
          user: {
            id: isAdmin ? 'usr_admin_1' : `usr_${Date.now()}`,
            email,
            name: email.split('@')[0] || 'User',
            role: isAdmin ? 'admin' : 'user',
            status: 'active',
            plan: 'pro',
            quotaLimit: 5000,
            quotaUsed: 1,
          },
          sessionToken: `sess_${Date.now()}`,
        });
      } catch (e: any) {
        return errorResponse(e.message, 500);
      }
    }

    // User Signup Endpoint
    if (pathname === '/api/auth/signup' && request.method === 'POST') {
      try {
        const body = (await request.json()) as any;
        const email = (body.email || '').trim().toLowerCase();

        return jsonResponse({
          user: {
            id: `usr_${Date.now()}`,
            email,
            name: body.name || email.split('@')[0],
            role: 'user', // Always user
            status: 'active',
            plan: 'free',
            quotaLimit: 1000,
            quotaUsed: 0,
          },
          sessionToken: `sess_${Date.now()}`,
        });
      } catch (e: any) {
        return errorResponse(e.message, 500);
      }
    }

    // Two-stage URL creation
    if (pathname === '/api/links' && request.method === 'POST') {
      try {
        const body = (await request.json()) as any;
        const originalUrl = (body.originalUrl || body.url || '').trim();
        if (!originalUrl) return errorResponse('Original URL is required', 400);

        try {
          new URL(originalUrl);
        } catch {
          return errorResponse('Invalid URL format. Must start with http:// or https://', 400);
        }

        const domain = body.customDomain && body.customDomain.trim() !== ''
          ? body.customDomain.trim()
          : 'urlshort.nasirdigitalhub.com';

        const customCodeInput = body.customCode ? body.customCode.trim() : '';

        // Prevent duplicate custom codes
        if (customCodeInput) {
          const existingCodeLink = await lookupLink(customCodeInput, request.url, env);
          if (existingCodeLink) {
            if (existingCodeLink.originalUrl === originalUrl && existingCodeLink.finalUrl && existingCodeLink.status === 'completed') {
              return jsonResponse({
                success: true,
                link: existingCodeLink,
                message: 'Returned existing active two-stage short link',
              });
            }
            return errorResponse('Custom short code already taken. Please choose another.', 400);
          }
        }

        const shortCode = customCodeInput || Math.random().toString(36).substring(2, 8);
        const firstStageUrl = `https://${domain}/${shortCode}`;

        // STAGE 1: Create and persist Stage 1 link FIRST so it resolves immediately
        const link: LinkRecord = {
          id: `lnk_${Date.now()}`,
          userId: 'guest',
          originalUrl,
          shortCode,
          shortUrl: firstStageUrl,
          stage1Url: firstStageUrl,
          stage1Code: `s1_${shortCode}`,
          vpsStage1Url: '',
          finalUrl: '',
          status: 'pending',
          clicks: 0,
          customDomain: domain,
          createdAt: new Date().toISOString(),
        };

        await persistLink(link, request.url, env, ctx);

        // STAGE 2: Call VPS API with exact Stage 1 URL
        const vpsRes = await callVpsApi('/api/links/stage1', 'POST', { url: firstStageUrl }, vpsBase);

        if (!vpsRes.ok || !vpsRes.data || !vpsRes.data.stage1_url) {
          // STAGE 2 FAILED: DO NOT RETURN A FAKE SUCCESSFUL URL
          link.status = 'failed';
          await persistLink(link, request.url, env, ctx);

          console.error(`[Stage 2 Error] VPS shortening failed: HTTP ${vpsRes.status}`, {
            stage1Url: firstStageUrl,
            status: vpsRes.status,
            data: vpsRes.data
          });

          return errorResponse(
            `Stage 2 VPS shortening failed (${vpsRes.status}): ${vpsRes.data?.message || vpsRes.data?.error || 'VPS API returned invalid response'}`,
            502
          );
        }

        // STAGE 2 SUCCEEDED! Extract real final URL
        const finalVpsUrl = vpsRes.data.stage1_url; // http://107.174.37.180/s1_CODE
        const stage1Code = vpsRes.data.stage1_code || `s1_${shortCode}`;
        const stage1Id = vpsRes.data.stage1_id || Date.now();

        link.finalUrl = finalVpsUrl;
        link.vpsStage1Url = finalVpsUrl;
        link.stage1Code = stage1Code;
        link.stage1Id = stage1Id;
        link.status = 'completed';

        // Persist updated completed link object across all storage tiers
        await persistLink(link, request.url, env, ctx);

        return jsonResponse({
          success: true,
          link,
          message: 'Two-stage link generated successfully: Stage 1 Boss Shortener -> Stage 2 VPS IP Short URL',
        });
      } catch (err: any) {
        return errorResponse(err.message, 500);
      }
    }

    // Direct proxy to VPS stage 1
    if ((pathname === '/api/links/stage1' || pathname === '/api/proxy/stage1') && request.method === 'POST') {
      try {
        const body = (await request.json()) as any;
        const vpsRes = await callVpsApi('/api/links/stage1', 'POST', body, vpsBase);
        return jsonResponse(vpsRes.data || { error: 'VPS returned empty response' }, vpsRes.status || 200);
      } catch (e: any) {
        return errorResponse(`Failed to communicate with VPS: ${e.message}`, 502);
      }
    }

    // Link resolver endpoint: GET /api/links/resolve/:code
    const resolveMatch = pathname.match(/^\/api\/links\/resolve\/([a-zA-Z0-9_-]{3,32})$/);
    if (resolveMatch && request.method === 'GET') {
      const code = resolveMatch[1];
      const link = await lookupLink(code, request.url, env);
      if (link && (link.originalUrl || link.original_url)) {
        return jsonResponse({
          success: true,
          originalUrl: link.originalUrl || link.original_url,
          link,
        });
      }
      return jsonResponse({ success: false, error: 'Short link not found' }, 404);
    }

    // Redirect handler for short code /:code
    const shortCodeMatch = pathname.match(/^\/([a-zA-Z0-9_-]{3,32})$/);
    const knownAppRoutes = [
      'dashboard',
      'admin',
      'pricing',
      'api',
      'assets',
      'cf-cache',
      'nachid',
      'login',
      'signup',
      'url-shortener',
      'free-url-shortener',
      'link-shortener',
      'short-url-generator',
      'custom-url-shortener',
      'branded-url-shortener',
      'url-shortener-with-analytics',
      'bulk-url-shortener',
      'qr-code-generator',
      'blog',
      'about',
      'contact',
      'privacy',
      'terms',
      'abuse',
      'robots.txt',
      'sitemap.xml'
    ];
    if (shortCodeMatch && !knownAppRoutes.includes(shortCodeMatch[1].toLowerCase()) && !shortCodeMatch[1].startsWith('blog')) {
      const code = shortCodeMatch[1];
      const link = await lookupLink(code, request.url, env);
      if (link && (link.originalUrl || link.original_url)) {
        const destination = link.originalUrl || link.original_url;

        // Async click recording
        if (env.DB) {
          const clickOp = env.DB.batch([
            env.DB.prepare('UPDATE links SET clicks = clicks + 1, updated_at = ? WHERE short_code = ?').bind(new Date().toISOString(), code),
            env.DB.prepare('INSERT INTO clicks (id, link_id, timestamp, referer, user_agent, ip_hash) VALUES (?, ?, ?, ?, ?, ?)').bind(
              `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              link.id || code,
              new Date().toISOString(),
              request.headers.get('referer') || 'Direct',
              request.headers.get('user-agent') || 'Unknown',
              'anonymized'
            ),
          ]);
          if (ctx?.waitUntil) ctx.waitUntil(clickOp);
        }

        return new Response(null, {
          status: 302,
          headers: {
            'Location': destination,
            'X-Robots-Tag': 'noindex, nofollow',
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            ...corsHeaders
          }
        });
      }
    }

    if (!pathname.startsWith('/api/')) {
      return serveSpaHtml(request, env);
    }

    return errorResponse('Not Found', 404);
  },
};
