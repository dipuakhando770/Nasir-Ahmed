import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  Zap,
  QrCode,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Shield,
  BarChart2,
  Globe,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  CheckSquare,
  Share2,
  Key,
  Server,
  Activity,
  AlertCircle
} from 'lucide-react';
import { LandingPageConfig } from '../data/landingPages.ts';
import { SeoHead } from './SeoHead.tsx';
import { api, LinkItem } from '../api/client.ts';

interface SeoLandingPageProps {
  config: LandingPageConfig;
  activeHost: string;
  theme: 'light' | 'dark';
  lang: 'en' | 'bn';
  onNavigate: (view: string, path: string) => void;
  onOpenQrModal: (url: string) => void;
  onLinkCreated?: (link: LinkItem) => void;
}

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({
  config,
  activeHost,
  theme,
  lang,
  onNavigate,
  onOpenQrModal,
  onLinkCreated
}) => {
  // Form States
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(activeHost || 'urlshort.nasirdigitalhub.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState<LinkItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Bulk Mode State
  const [bulkInput, setBulkInput] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<LinkItem[]>([]);
  const [bulkCopied, setBulkCopied] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyAllBulk = () => {
    const allLinks = bulkResults
      .map(r => r.finalUrl || r.vpsStage1Url || r.shortUrl)
      .join('\n');
    navigator.clipboard.writeText(allLinks);
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 2500);
  };

  const handleSingleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;

    setLoading(true);
    setError('');
    setCreatedResult(null);

    try {
      const res = await api.createLink({
        originalUrl: longUrl,
        customCode: customCode || undefined,
        customDomain: selectedDomain
      });

      setCreatedResult(res.link);
      setLongUrl('');
      if (config.toolMode !== 'custom') setCustomCode('');

      if (onLinkCreated && res.link) {
        onLinkCreated(res.link);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawLines = bulkInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (rawLines.length === 0) return;
    if (rawLines.length > 20) {
      setError('Please limit bulk shortening to 20 URLs at a time.');
      return;
    }

    setBulkLoading(true);
    setError('');
    const results: LinkItem[] = [];

    for (const url of rawLines) {
      try {
        const res = await api.createLink({
          originalUrl: url,
          customDomain: selectedDomain
        });
        if (res.link) {
          results.push(res.link);
          if (onLinkCreated) onLinkCreated(res.link);
        }
      } catch (err) {
        console.warn(`Bulk URL failure for ${url}:`, err);
      }
    }

    setBulkResults(results);
    setBulkLoading(false);
  };

  // Structured Data Schema for this Landing Page
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: config.h1,
      url: `https://urlshort.nasirdigitalhub.com${config.path}`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      description: config.metaDescription,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://urlshort.nasirdigitalhub.com/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: config.badgeText,
          item: `https://urlshort.nasirdigitalhub.com${config.path}`
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  ];

  return (
    <div className="space-y-16 py-4 animate-fadeIn">
      <SeoHead
        title={config.title}
        description={config.metaDescription}
        canonicalPath={config.path}
        schema={schema}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <button
          onClick={() => onNavigate('home', '/')}
          className="hover:text-indigo-400 transition-colors"
        >
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-200 font-medium">{config.badgeText}</span>
      </nav>

      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{config.badgeText}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-wrap balance leading-tight">
          {config.h1}
        </h1>

        <p className={`text-base md:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          {config.subheading}
        </p>

        {/* Interactive Tool Widget */}
        <div className={`mt-8 p-5 md:p-7 rounded-2xl border shadow-2xl text-left ${theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'} space-y-5`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300">Live Redirection Engine Active</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">VPS · Sub-30ms</span>
          </div>

          {/* BULK SHORTENER MODE */}
          {config.toolMode === 'bulk' ? (
            <form onSubmit={handleBulkShorten} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Paste Multiple URLs (One per line, up to 20 links):
                </label>
                <textarea
                  rows={5}
                  required
                  value={bulkInput}
                  onChange={e => setBulkInput(e.target.value)}
                  placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                  className={`w-full p-3.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
                />
              </div>

              <button
                type="submit"
                disabled={bulkLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {bulkLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Batch Shorten All URLs</span>
                  </>
                )}
              </button>

              {bulkResults.length > 0 && (
                <div className="mt-4 p-4 rounded-xl border border-indigo-500/30 bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{bulkResults.length} Links Shortened Successfully!</span>
                    </span>
                    <button
                      type="button"
                      onClick={copyAllBulk}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {bulkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{bulkCopied ? 'All Copied' : 'Copy All Links'}</span>
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {bulkResults.map((bLink, idx) => (
                      <div key={bLink.id || idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                        <div className="truncate min-w-0 pr-2">
                          <span className="text-indigo-400 font-mono font-bold block truncate">
                            {bLink.finalUrl || bLink.vpsStage1Url || bLink.shortUrl}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate block">
                            ➜ {bLink.originalUrl}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(bLink.finalUrl || bLink.vpsStage1Url || bLink.shortUrl)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0"
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* STANDARD / CUSTOM / QR / FREE MODE FORM */
            <form onSubmit={handleSingleShorten} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    required
                    value={longUrl}
                    onChange={e => setLongUrl(e.target.value)}
                    placeholder="Paste your long link here (e.g. https://example.com/very-long-path)..."
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Shorten URL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Custom Slugs & Branded Domain Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Branded Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={e => setSelectedDomain(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  >
                    <option value="urlshort.nasirdigitalhub.com">urlshort.nasirdigitalhub.com (Cloudflare Frontend)</option>
                    <option value="content.org">content.org (Two-Stage Domain)</option>
                    {activeHost && activeHost !== 'content.org' && activeHost !== 'urlshort.nasirdigitalhub.com' && (
                      <option value={activeHost}>{activeHost} (Current Host)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Custom Slug / Back-Half (Optional)
                  </label>
                  <input
                    type="text"
                    value={customCode}
                    onChange={e => setCustomCode(e.target.value)}
                    placeholder="e.g. launch2026"
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'} ${config.toolMode === 'custom' ? 'border-indigo-500 ring-1 ring-indigo-500/50' : ''}`}
                  />
                </div>
              </div>
            </form>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SINGLE RESULT CARD */}
          {createdResult && (
            <div className={`mt-4 p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-200'} space-y-3 animate-fadeIn`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Short link ready!</span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                  Two-Stage Pipeline Verified
                </span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium text-slate-400 mb-0.5 uppercase tracking-wider">Final Short URL:</div>
                  <a
                    href={createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 font-mono text-base font-bold hover:underline truncate block"
                  >
                    {createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl}
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenQrModal(createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <a
                    href={createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* QR Preview If QR Mode */}
              {config.toolMode === 'qr' && (
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl)}`}
                      alt="Generated QR Code"
                      className="w-20 h-20"
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-slate-200">High-Resolution QR Code Generated</div>
                    <div className="text-slate-400">Scan directly with your phone camera or save for print packaging.</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Overview & Search Intent Content */}
      <section className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          About {config.h1}
        </h2>
        <p className={`text-base leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
          {config.introParagraph}
        </p>
      </section>

      {/* Key Features Grid */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Why Choose Boss URL Shortener</h2>
          <p className="text-sm text-slate-400">Built for high scale, maximum deliverability, and developer flexibility.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {config.keyFeatures.map((feature, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}
            >
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (Numbered Steps) */}
      <section className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-center">How It Works in 3 Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {config.howItWorks.map(step => (
            <div
              key={step.step}
              className={`p-6 rounded-2xl border text-center space-y-3 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto text-sm">
                {step.step}
              </div>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Real-World Use Cases */}
      <section className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Recommended Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {config.useCases.map((uc, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}
            >
              <h3 className="text-sm font-semibold text-indigo-400">{uc.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about our link shortening and redirection tools.</p>
        </div>

        <div className="space-y-3">
          {config.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 border-t border-slate-800/60 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Internal Linking & Next Steps */}
      <section className={`p-8 rounded-2xl border text-center space-y-6 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
        <h2 className="text-2xl font-bold">{config.ctaHeading}</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">{config.ctaSubtext}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Start Shortening Free
          </button>
          <button
            onClick={() => onNavigate('blog', '/blog')}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Explore Link Guides
          </button>
          <button
            onClick={() => onNavigate('pricing', '/pricing')}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            View Pro Plans
          </button>
        </div>
      </section>
    </div>
  );
};
