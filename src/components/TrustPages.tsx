import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Server,
  Globe,
  ChevronRight,
  Send,
  HelpCircle,
  FileText
} from 'lucide-react';
import { SeoHead } from './SeoHead.tsx';
import { api } from '../api/client.ts';

interface TrustPageProps {
  pageType: 'about' | 'contact' | 'privacy' | 'terms' | 'abuse';
  theme: 'light' | 'dark';
  onNavigate: (view: string, path: string) => void;
}

export const TrustPages: React.FC<TrustPageProps> = ({ pageType, theme, onNavigate }) => {
  // Abuse Form State
  const [abuseShortCode, setAbuseShortCode] = useState('');
  const [abuseReason, setAbuseReason] = useState('phishing');
  const [abuseEmail, setAbuseEmail] = useState('');
  const [abuseSubmitting, setAbuseSubmitting] = useState(false);
  const [abuseSuccess, setAbuseSuccess] = useState('');
  const [abuseError, setAbuseError] = useState('');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleAbuseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAbuseError('');
    setAbuseSuccess('');
    setAbuseSubmitting(true);

    try {
      const res = await api.reportAbuse({
        shortCode: abuseShortCode,
        reason: abuseReason,
        reporterEmail: abuseEmail
      });
      setAbuseSuccess(res.message || 'Report submitted successfully. Our security team will review and take down malicious links immediately.');
      setAbuseShortCode('');
      setAbuseEmail('');
    } catch (err: any) {
      setAbuseError(err.message || 'Failed to submit abuse report. Please try again or email security directly.');
    } finally {
      setAbuseSubmitting(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  if (pageType === 'about') {
    return (
      <div className="space-y-10 py-4 max-w-4xl mx-auto animate-fadeIn">
        <SeoHead
          title="About Boss URL Shortener — High-Speed Link Infrastructure"
          description="Learn about Boss URL Shortener, our two-stage VPS architecture, high-availability edge routing, and commitment to link security."
          canonicalPath="/about"
        />
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
          <button onClick={() => onNavigate('home', '/')} className="hover:text-indigo-400">Home</button>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 font-medium">About Us</span>
        </nav>

        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Server className="w-3.5 h-3.5" />
            <span>Infrastructure & Mission</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">About Boss URL Shortener</h1>
          <p className="text-slate-400 text-base md:text-lg">
            Engineering resilient, ultra-low-latency URL shortening and click intelligence infrastructure for the modern web.
          </p>
        </header>

        <div className="space-y-6 text-sm md:text-base leading-relaxed text-slate-300">
          <p>
            Boss URL Shortener was established to solve a common frustration with legacy link shortening platforms: aggressive paywalls, link rot, slow redirection speeds, and invasive tracking.
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 pt-4">Our Two-Stage Architectural Philosophy</h2>
          <p>
            Unlike traditional single-server shorteners, Boss URL Shortener utilizes an authoritative two-stage pipeline. Stage 1 distributes branded links across Cloudflare edge nodes for sub-30ms global lookups, while Stage 2 coordinates with dedicated backend VPS infrastructure (at 107.174.37.180) to ensure continuous database integrity and uptime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <div className="text-indigo-400 font-bold text-lg">99.99%</div>
              <div className="text-xs text-slate-400">Target Uptime SLA across global edge nodes</div>
            </div>
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <div className="text-emerald-400 font-bold text-lg">&lt; 30 ms</div>
              <div className="text-xs text-slate-400">Average redirect latency to destination</div>
            </div>
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <div className="text-violet-400 font-bold text-lg">0 PII</div>
              <div className="text-xs text-slate-400">Privacy-first anonymized click telemetry</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'contact') {
    return (
      <div className="space-y-10 py-4 max-w-4xl mx-auto animate-fadeIn">
        <SeoHead
          title="Contact Us & Support — Boss URL Shortener"
          description="Get in touch with the Boss URL Shortener engineering and customer support team for inquiries, API support, or custom enterprise domains."
          canonicalPath="/contact"
        />
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
          <button onClick={() => onNavigate('home', '/')} className="hover:text-indigo-400">Home</button>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 font-medium">Contact & Support</span>
        </nav>

        <header className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Contact Our Team</h1>
          <p className="text-slate-400 text-base md:text-lg">
            Have questions about enterprise plans, API integrations, or custom domains? We are here to help.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h2 className="text-lg font-bold">Send Us a Message</h2>
            {contactSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div className="font-semibold">Message Received!</div>
                <div>Thank you for reaching out. An engineer will respond to your inquiry shortly.</div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs"
                    placeholder="jane@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs"
                    placeholder="How can our team assist you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Direct Email</div>
              <div className="text-sm font-medium text-slate-200">admin@urlshort.nasirdigitalhub.com</div>
              <div className="text-xs text-slate-400">We respond to technical and business inquiries within 24 hours.</div>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Report Malicious Links</div>
              <div className="text-xs text-slate-400">
                Found a phishing or malware link created through our service? Use our dedicated abuse portal for immediate automated inspection.
              </div>
              <button
                type="button"
                onClick={() => onNavigate('abuse', '/abuse')}
                className="text-xs text-rose-400 font-semibold hover:underline inline-block pt-1"
              >
                Go to Abuse Reporting Portal ➜
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'privacy') {
    return (
      <div className="space-y-8 py-4 max-w-4xl mx-auto animate-fadeIn">
        <SeoHead
          title="Privacy Policy — Boss URL Shortener"
          description="Read the Boss URL Shortener Privacy Policy. Discover how we protect user data, hash IP addresses, and respect GDPR and CCPA privacy standards."
          canonicalPath="/privacy"
        />
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
          <button onClick={() => onNavigate('home', '/')} className="hover:text-indigo-400">Home</button>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 font-medium">Privacy Policy</span>
        </nav>

        <header className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: November 1, 2026</p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-slate-300 border-t border-slate-800 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">1. Information We Collect</h2>
            <p>
              When visitors access links created through Boss URL Shortener, our servers record minimal, non-personally identifiable technical telemetry necessary for routing and analytics: timestamp, HTTP referrer header, user-agent string (to identify device type), and a one-way hashed representation of the IP address. We do not store raw IP addresses in permanent analytics databases.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">2. Cookies and Tracking</h2>
            <p>
              Boss URL Shortener does not inject third-party advertising cookies into redirection flows. Registered user sessions use secure authentication tokens stored in local storage and HTTP headers exclusively for account authentication.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">3. GDPR & CCPA Compliance</h2>
            <p>
              We honor all European Union General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA) user rights, including rights to data export, account deletion, and rectification.
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (pageType === 'terms') {
    return (
      <div className="space-y-8 py-4 max-w-4xl mx-auto animate-fadeIn">
        <SeoHead
          title="Terms of Service & Acceptable Use — Boss URL Shortener"
          description="Review the Boss URL Shortener Terms of Service, Acceptable Use Policy, spam prohibitions, and service guarantees."
          canonicalPath="/terms"
        />
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
          <button onClick={() => onNavigate('home', '/')} className="hover:text-indigo-400">Home</button>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 font-medium">Terms of Service</span>
        </nav>

        <header className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last updated: November 1, 2026</p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-slate-300 border-t border-slate-800 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Boss URL Shortener, you agree to be bound by these Terms of Service. If you disagree with any portion of these terms, you must not use our link generation tools.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">2. Prohibited Content & Zero-Tolerance Abuse Policy</h2>
            <p>
              Users may not create short links pointing to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Phishing portals, fake credential harvesters, or deceptive login pages.</li>
              <li>Malware, ransomware, spyware, or malicious script downloads.</li>
              <li>Spam dissemination, unsolicited bulk email campaigns, or deceptive redirects.</li>
              <li>Content violating applicable local or international laws.</li>
            </ul>
            <p>
              Any short link verified as violating this policy will be disabled immediately without warning, and the creating IP or account will be permanently banned.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">3. Service Availability & Modifications</h2>
            <p>
              While we strive for continuous 99.99% availability across our two-stage VPS and edge infrastructure, services are provided on an "as is" and "as available" basis.
            </p>
          </section>
        </div>
      </div>
    );
  }

  // ABUSE PORTAL
  return (
    <div className="space-y-8 py-4 max-w-3xl mx-auto animate-fadeIn">
      <SeoHead
        title="Report Abuse & Phishing Links — Boss URL Shortener"
        description="Report suspicious, malicious, or phishing short links created through Boss URL Shortener for immediate inspection and takedown."
        canonicalPath="/abuse"
      />
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <button onClick={() => onNavigate('home', '/')} className="hover:text-indigo-400">Home</button>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-200 font-medium">Report Abuse</span>
      </nav>

      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Security & Takedowns</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Report Malicious or Abusive Links</h1>
        <p className="text-slate-400 text-sm md:text-base">
          Boss URL Shortener maintains a zero-tolerance policy against phishing, malware, spam, and fraud. Submit suspicious short links below for rapid review and takedown.
        </p>
      </header>

      <div className="p-6 md:p-8 rounded-2xl border border-rose-500/30 bg-slate-900/80 space-y-5">
        {abuseSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Report Successfully Logged</span>
            </div>
            <div>{abuseSuccess}</div>
          </div>
        )}

        {abuseError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {abuseError}
          </div>
        )}

        <form onSubmit={handleAbuseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Short Code or Short Link URL *
            </label>
            <input
              type="text"
              required
              value={abuseShortCode}
              onChange={e => setAbuseShortCode(e.target.value)}
              placeholder="e.g. aB92xK or https://urlshort.nasirdigitalhub.com/aB92xK"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Reason for Reporting *
            </label>
            <select
              value={abuseReason}
              onChange={e => setAbuseReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="phishing">Phishing or Credential Harvesting</option>
              <option value="malware">Malware or Ransomware Download</option>
              <option value="spam">Unsolicited Spam or Bulk Deception</option>
              <option value="scam">Financial Scam or Fraud</option>
              <option value="copyright">Copyright Infringement</option>
              <option value="other">Other Violation of Terms</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Your Email Address (for confirmation updates) *
            </label>
            <input
              type="email"
              required
              value={abuseEmail}
              onChange={e => setAbuseEmail(e.target.value)}
              placeholder="security-officer@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={abuseSubmitting}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {abuseSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Submit Abuse Report Immediately</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
