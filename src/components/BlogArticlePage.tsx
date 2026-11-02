import React from 'react';
import {
  Clock,
  Calendar,
  User,
  ChevronRight,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { BlogArticle, BLOG_ARTICLES } from '../data/blogArticles.ts';
import { autoLinkContent } from '../data/internalLinking.ts';
import { SeoHead } from './SeoHead.tsx';

interface BlogArticlePageProps {
  article: BlogArticle;
  theme: 'light' | 'dark';
  onNavigate: (view: string, path: string) => void;
  onSelectArticle: (slug: string) => void;
}

export const BlogArticlePage: React.FC<BlogArticlePageProps> = ({
  article,
  theme,
  onNavigate,
  onSelectArticle
}) => {
  const articleUrl = `https://urlshort.nasirdigitalhub.com/blog/${article.slug}`;

  const relatedArticles = BLOG_ARTICLES.filter(a => article.relatedSlugs.includes(a.slug));

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.metaDescription,
      datePublished: article.publishedDate,
      dateModified: article.modifiedDate,
      author: {
        '@type': 'Person',
        name: article.author.name,
        jobTitle: article.author.role
      },
      publisher: {
        '@type': 'Organization',
        name: 'Boss URL Shortener',
        logo: {
          '@type': 'ImageObject',
          url: 'https://urlshort.nasirdigitalhub.com/assets/aistudio/image_0b1e7d27.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl
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
          name: 'Blog',
          item: 'https://urlshort.nasirdigitalhub.com/blog'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: articleUrl
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faqs.map(faq => ({
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
    <div className="space-y-12 py-4 max-w-4xl mx-auto animate-fadeIn">
      <SeoHead
        title={`${article.title} | Boss URL Shortener`}
        description={article.metaDescription}
        canonicalPath={`/blog/${article.slug}`}
        ogType="article"
        publishedTime={article.publishedDate}
        modifiedTime={article.modifiedDate}
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
        <button
          onClick={() => onNavigate('blog', '/blog')}
          className="hover:text-indigo-400 transition-colors"
        >
          Knowledge Hub
        </button>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-200 font-medium truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="space-y-5 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <span>{article.category}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className={`text-base md:text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
          {article.summary}
        </p>

        {/* Author & Timestamp Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-sm">
              {article.author.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-slate-200">{article.author.name}</div>
              <div className="text-[11px] text-slate-400">{article.author.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(article.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.readTime}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Article Body Content */}
      <article className="space-y-6 text-sm md:text-base leading-relaxed">
        {article.content.map((paragraph, idx) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h2 key={idx} className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 pt-6">
                {paragraph.replace('### ', '')}
              </h2>
            );
          }
          if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
            const lines = paragraph.split('\n');
            return (
              <div key={idx} className="space-y-2.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                {lines.map((line, lIdx) => (
                  <div key={lIdx} className="flex items-start gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{line.replace(/^(\d+\. |- )/, '')}</span>
                  </div>
                ))}
              </div>
            );
          }
          return (
            <p key={idx} className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`} dangerouslySetInnerHTML={{ __html: autoLinkContent(paragraph) }} />
          );
        })}
      </article>

      {/* Inline Product CTA */}
      <div className="p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider font-semibold text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try It Yourself</span>
          </div>
          <h3 className="text-lg font-bold">Need to shorten a link right now?</h3>
          <p className="text-xs text-slate-400">Experience zero-friction URL shortening with instant redirects and free QR codes.</p>
        </div>
        <button
          onClick={() => onNavigate('home', '/')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs whitespace-nowrap shadow-md transition-all cursor-pointer"
        >
          Shorten URL Free
        </button>
      </div>

      {/* Frequently Asked Questions */}
      {article.faqs.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-800">
          <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {article.faqs.map((faq, fIdx) => (
              <div key={fIdx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                <h3 className="text-sm font-semibold text-indigo-300">{faq.question}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Guides */}
      {relatedArticles.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-800">
          <h2 className="text-xl font-bold">Related Guides & Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map(rel => (
              <div
                key={rel.slug}
                onClick={() => onSelectArticle(rel.slug)}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/50 cursor-pointer transition-all space-y-2"
              >
                <span className="text-[10px] font-medium text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  {rel.category}
                </span>
                <h3 className="text-xs font-bold line-clamp-2 text-slate-200 hover:text-indigo-400">
                  {rel.title}
                </h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <div className="pt-6">
        <button
          onClick={() => onNavigate('blog', '/blog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Knowledge Hub</span>
        </button>
      </div>
    </div>
  );
};
