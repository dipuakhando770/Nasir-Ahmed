import React from 'react';
import { Link as LinkIcon, Shield, Menu, Sun, Moon, Languages, LogOut, User } from 'lucide-react';

interface NavbarProps {
  currentUser: any;
  theme: 'light' | 'dark';
  lang: 'en' | 'bn';
  onNavigate: (view: string, path: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  brand: string;
}

export const PremiumNavbar: React.FC<NavbarProps> = ({ currentUser, theme, lang, onNavigate, onLogout, onToggleTheme, onToggleLang, brand }) => {
  return (
    <header className={`sticky top-0 z-50 border-b ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <LinkIcon className="w-5 h-5" />
          </div>
          <span onClick={() => onNavigate('home', '/')} className="text-xl font-bold tracking-tight cursor-pointer">
            {brand}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button onClick={() => onNavigate('home', '/')} className="hover:text-indigo-500 transition-colors">Home</button>
          <button onClick={() => onNavigate('landing:free-url-shortener', '/free-url-shortener')} className="hover:text-indigo-500 transition-colors">Free Tools</button>
          <button onClick={() => onNavigate('blog', '/blog')} className="hover:text-indigo-500 transition-colors">Guides</button>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-slate-800/10">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          {currentUser ? (
             <button onClick={onLogout} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500">Sign Out</button>
          ) : (
            <button onClick={() => onNavigate('login', '/login')} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500">Sign In</button>
          )}
        </div>
      </div>
    </header>
  );
};
