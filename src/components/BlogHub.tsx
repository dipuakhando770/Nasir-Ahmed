import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Clock,
  User,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Tag
} from 'lucide-react';
import { BLOG_ARTICLES, BlogArticle } from '../data/blogArticles.ts';
import { SeoHead } from './SeoHead.tsx';

interface BlogHubProps {
  theme: 'light' | 'dark';
  onNavigate: (view: string, path: string) => void;
  onSelectArticle: (slug: string) => void;
}

export const BlogHub: React.FC<BlogHubProps> = ({
  theme,
  onNavigate,
  onSelectArticle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Fundamentals', 'Tutorials', 'Marketing', 'Branding', 'Analytics', 'Security'];

  const filteredArticles = BLOG_ARTICLES.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Boss URL Shortener Knowledge Hub & Educational Blog',
    description: 'Expert guides, best practices, and technical tutorials on link shortening, click analytics, QR codes, and digital marketing.',
    url: 'https://urlshort.nasirdigitalhub.com/blog'
  };

  return (
    <div className="space-y-12 py-4 animate-fadeIn">
      <SeoHead
        title="URL Shortener Guides, Best Practices & Knowledge Hub | Boss"
        description="Explore in-depth tutorials and best practices on URL shortening, real-time click tracking, custom domains, and digital link marketing."
        canonicalPath="/blog"
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
        <span className="text-slate-200 font-medium">Knowledge Hub</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Educational Resources & Technical Guides</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          URL Shortening & Link Intelligence Hub
        </h1>
        <p className={`text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          Practical, actionable tutorials designed to help marketers, developers, and creators maximize link engagement, track conversions, and safeguard brand equity.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-xs font-medium">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${selectedCategory === cat ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search guides..."
            className={`w-full pl-9 pr-4 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredArticles.map(article => (
          <article
            key={article.slug}
            onClick={() => onSelectArticle(article.slug)}
            className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-xl ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                  {article.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readTime}</span>
                </span>
              </div>

              <h2 className="text-lg font-bold hover:text-indigo-400 transition-colors line-clamp-2">
                {article.title}
              </h2>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                  {article.author.name.charAt(0)}
                </div>
                <span>{article.author.name}</span>
              </div>

              <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No articles found matching "{searchTerm}". Try another search term.
        </div>
      )}
    </div>
  );
};
