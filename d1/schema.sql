-- Cloudflare D1 Database Schema for Boss URL Shortener SaaS
-- Branded Domain: urlshort.nasirdigitalhub.com
-- Authoritative VPS: http://107.174.37.180

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
  plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'pro', 'enterprise')),
  quota_limit INTEGER DEFAULT 1000,
  quota_used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  short_url TEXT NOT NULL,
  stage1_id INTEGER,
  stage1_code TEXT,
  stage1_url TEXT,
  final_url TEXT,
  status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'pending', 'failed', 'expired')),
  clicks INTEGER DEFAULT 0,
  custom_domain TEXT DEFAULT 'urlshort.nasirdigitalhub.com',
  password_hash TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clicks (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  timestamp TEXT NOT NULL,
  referer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  device TEXT,
  browser TEXT
);

CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('verified', 'pending', 'failed')),
  verification_token TEXT NOT NULL,
  dns_record TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS abuse_reports (
  id TEXT PRIMARY KEY,
  link_id TEXT,
  short_code TEXT,
  reason TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'resolved')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TEXT NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_links_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_user ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_clicks_link ON clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_domains_user ON domains(user_id);
