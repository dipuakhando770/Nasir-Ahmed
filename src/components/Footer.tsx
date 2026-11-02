import React from 'react';
import {
  Link as LinkIcon,
  Shield,
  Server,
  Globe,
  ExternalLink,
  Heart,
  Languages
} from 'lucide-react';

interface FooterProps {
  theme: 'light' | 'dark';
  lang: 'en' | 'bn';
  onNavigate: (view: string, path: string) => void;
  onToggleLang: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  theme,
  lang,
  onNavigate,
  onToggleLang
}) => {
  return (
    <footer className={`mt-20 border-t ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'} transition-colors`}>
      <div className="max-w-7xl mx-auto px-6 py-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Status */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <LinkIcon className="w-4 h-4" />
              </div>
              <span
                onClick={() => onNavigate('home', '/')}
                className="text-lg font-bold tracking-tight text-white cursor-pointer"
              >
                Boss URL Shortener
              </span>
            </div>

            <p className="text-xs leading-relaxed max-w-sm">
              Enterprise-grade URL shortening and link intelligence platform with two-stage Boss VPS backend routing, custom branded domains, and real-time click tracking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>VPS System Normal</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                <Shield className="w-3 h-3" />
                <span>SSL 256-bit Encrypted</span>
              </span>
            </div>
          </div>

          {/* Col 2: Products & Tools */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Link Tools
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('landing:url-shortener', '/url-shortener')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  URL Shortener
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('landing:free-url-shortener', '/free-url-shortener')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Free URL Shortener
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('landing:custom-url-shortener', '/custom-url-shortener')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Custom URL Shortener
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('landing:short-url-generator', '/short-url-generator')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Short URL Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('landing:bulk-url-shortener', '/bulk-url-shortener')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Bulk URL Shortener
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('landing:qr-code-generator', '/qr-code-generator')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  QR Code Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Guides */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Educational Guides
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('blog', '/blog')}
                  className="hover:text-indigo-400 transition-colors text-left font-medium text-indigo-400"
                >
                  Knowledge Hub (All Guides)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog:what-is-a-url-shortener', '/blog/what-is-a-url-shortener')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  What Is a URL Shortener?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog:how-to-shorten-a-long-url-free', '/blog/how-to-shorten-a-long-url-free')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  How to Shorten URLs Free
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog:benefits-of-short-urls', '/blog/benefits-of-short-urls')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Benefits of Short Links
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog:how-to-track-link-clicks', '/blog/how-to-track-link-clicks')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  How to Track Link Clicks
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog:how-to-create-qr-codes-from-urls', '/blog/how-to-create-qr-codes-from-urls')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  QR Codes from Short Links
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Trust & Legal
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about', '/about')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  About Our Platform
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact', '/contact')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy', '/privacy')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms', '/terms')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('abuse', '/abuse')}
                  className="hover:text-rose-400 transition-colors text-left text-rose-400 font-medium"
                >
                  Report Malicious Links
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pricing', '/pricing')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Subscription Pricing
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Utilities */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Boss URL Shortener SaaS. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'en' ? 'Switch to বাংলা' : 'Switch to English'}</span>
            </button>
            <span className="text-slate-600">&bull;</span>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              XML Sitemap
            </a>
            <span className="text-slate-600">&bull;</span>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              robots.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
