/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  BarChart2,
  Globe,
  Shield,
  Zap,
  QrCode,
  LogOut,
  User as UserIcon,
  Settings,
  ExternalLink,
  Trash2,
  Server,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Search,
  Lock,
  Sun,
  Moon,
  Languages,
  Activity,
  CheckCircle2,
  AlertCircle,
  Share2,
  RefreshCw,
  Key,
  Users,
  Layers,
  Clock,
  CheckSquare,
  XCircle,
  Sliders,
  LogIn,
  UserPlus
} from 'lucide-react';

import {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  logSafeEvent,
  User as FirebaseUser
} from './firebase.ts';
import { api, LinkItem, User, DomainItem, AnalyticsData } from './api/client.ts';
import { SeoHead } from './components/SeoHead.tsx';
import { SeoLandingPage } from './components/SeoLandingPage.tsx';
import { BlogHub } from './components/BlogHub.tsx';
import { BlogArticlePage } from './components/BlogArticlePage.tsx';
import { TrustPages } from './components/TrustPages.tsx';
import { Footer } from './components/Footer.tsx';
import { LANDING_PAGES } from './data/landingPages.ts';
import { BLOG_ARTICLES, BlogArticle } from './data/blogArticles.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Top-level Navigation: 'home' | 'dashboard' | 'admin' | 'login' | 'signup' | 'pricing' | 'landing' | 'blog' | 'blog-article' | 'about' | 'contact' | 'privacy' | 'terms' | 'abuse'
  const [view, setView] = useState<string>('home');
  const [activeLandingSlug, setActiveLandingSlug] = useState<string>('url-shortener');
  const [activeBlogSlug, setActiveBlogSlug] = useState<string>('what-is-a-url-shortener');

  // User Dashboard Tabs: 'shorten' | 'links' | 'analytics' | 'domains' | 'package'
  const [userTab, setUserTab] = useState<'shorten' | 'links' | 'analytics' | 'domains' | 'package'>('shorten');
  // Admin Panel Tabs: 'overview' | 'users' | 'links' | 'domains' | 'packages' | 'analytics' | 'settings' | 'health'
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'links' | 'domains' | 'packages' | 'analytics' | 'settings' | 'health'>('overview');

  // Dedicated Admin Login Form State
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  // URL Shortener Form State
  const [activeHost, setActiveHost] = useState('urlshort.nasirdigitalhub.com');
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customDomain, setCustomDomain] = useState('urlshort.nasirdigitalhub.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState<LinkItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState('');

  // User Data State
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [guestLinks, setGuestLinks] = useState<LinkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newDomainNotes, setNewDomainNotes] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Admin Data State
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminLinks, setAdminLinks] = useState<LinkItem[]>([]);
  const [adminDomains, setAdminDomains] = useState<DomainItem[]>([]);
  const [adminApiHealth, setAdminApiHealth] = useState<any>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Modals State
  const [qrModalLink, setQrModalLink] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Translations
  const t = {
    en: {
      brand: 'Boss URL Shortener',
      tagline: 'Enterprise URL Shortening & Redirect SaaS',
      shortenPlaceholder: 'Paste your long URL here (e.g. https://example.com/very-long-path)...',
      shortenBtn: 'Shorten URL',
      navHome: 'Home',
      navDashboard: 'User Dashboard',
      navAdmin: 'Admin Console',
      navPricing: 'Pricing',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      getStarted: 'Get Started Free',
      featuresTitle: 'Built for High-Scale Enterprise Performance',
      featuresSubtitle: 'Powered by reliable infrastructure with Boss VPS backend integration, instant redirects, and real-time analytics.',
      copySuccess: 'Copied to clipboard!',
      customDomainLabel: 'Custom Branded Domain',
      customCodeLabel: 'Custom Short Code (optional)',
      resetPassword: 'Reset Password',
      forgotPasswordLink: 'Forgot password?',
      sendResetLink: 'Send Reset Link',
      backToLogin: 'Back to Sign In',
      userShortenTab: 'Shorten URL',
      userLinksTab: 'My Links',
      userAnalyticsTab: 'My Analytics',
      userDomainsTab: 'Custom Domains',
      adminOverviewTab: 'Platform Overview',
      adminUsersTab: 'User Management',
      adminLinksTab: 'Platform Links',
      adminDomainsTab: 'Domain Approvals',
      adminHealthTab: 'API Health Monitoring'
    },
    bn: {
      brand: 'বস্ ইউআরএল শর্টেনার',
      tagline: 'এন্টারপ্রাইজ ইউআরএল শর্টনিং এবং রিডাইরেক্ট স্যাস',
      shortenPlaceholder: 'আপনার বড় ইউআরএল এখানে পেস্ট করুন (যেমন: https://example.com)...',
      shortenBtn: 'সংক্ষিপ্ত করুন',
      navHome: 'হোম',
      navDashboard: 'ইউজার ড্যাশবোর্ড',
      navAdmin: 'অ্যাডমিন কনসোল',
      navPricing: 'মূল্যতালিকা',
      signIn: 'লগইন',
      signOut: 'লগআউট',
      getStarted: 'বিনামূল্যে শুরু করুন',
      featuresTitle: 'উচ্চ-ক্ষমতাসম্পন্ন এন্টারপ্রাইজ পারফরম্যান্সের জন্য তৈরি',
      featuresSubtitle: 'বস্ ভিপিএস ব্যাকএন্ড ইন্টিগ্রেশন, তাৎক্ষণিক রিডাইরেক্ট এবং রিয়েল-টাইম অ্যানালিটিক্স দ্বারা পরিচালিত।',
      copySuccess: 'কপি করা হয়েছে!',
      customDomainLabel: 'কাস্টম ব্র্যান্ডেড ডোমেইন',
      customCodeLabel: 'কাস্টম শর্ট কোড (ঐচ্ছিক)',
      resetPassword: 'পাসওয়ার্ড রিসেট',
      forgotPasswordLink: 'পাসওয়ার্ড ভুলে গেছেন?',
      sendResetLink: 'রিসেট লিঙ্ক পাঠান',
      backToLogin: 'লগইনে ফিরে যান',
      userShortenTab: 'ইউআরএল সংক্ষিপ্ত করুন',
      userLinksTab: 'আমার লিঙ্কসমূহ',
      userAnalyticsTab: 'আমার অ্যানালিটিক্স',
      userDomainsTab: 'কাস্টম ডোমেইন',
      adminOverviewTab: 'প্ল্যাটফর্ম ওভারভিউ',
      adminUsersTab: 'ব্যবহারকারী পরিচালনা',
      adminLinksTab: 'প্ল্যাটফর্ম লিঙ্কসমূহ',
      adminDomainsTab: 'ডোমেইন অনুমোদন',
      adminHealthTab: 'এপিআই হেলথ মনিটরিং'
    }
  }[lang];

  const navigateTo = (targetView: string, path = '/') => {
    if (targetView.startsWith('landing:')) {
      const slug = targetView.replace('landing:', '');
      setActiveLandingSlug(slug);
      setView('landing');
    } else if (targetView.startsWith('blog:')) {
      const slug = targetView.replace('blog:', '');
      setActiveBlogSlug(slug);
      setView('blog-article');
    } else {
      setView(targetView);
    }

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Auto-detect active host domain on load and handle SPA route initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        setActiveHost(host);
        setCustomDomain(host);
      } else {
        setActiveHost('urlshort.nasirdigitalhub.com');
        setCustomDomain('urlshort.nasirdigitalhub.com');
      }

      const path = window.location.pathname.toLowerCase();
      const cleanPath = path.replace(/^\/+/, '');

      if (path.startsWith('/nachid/admin') || path.startsWith('/nachid') || path.startsWith('/admin')) {
        setView('admin');
        if (path.includes('/users')) setAdminTab('users');
        else if (path.includes('/links')) setAdminTab('links');
        else if (path.includes('/packages')) setAdminTab('packages');
        else if (path.includes('/domains')) setAdminTab('domains');
        else if (path.includes('/analytics')) setAdminTab('analytics');
        else if (path.includes('/settings') || path.includes('/health')) setAdminTab('health');
        else setAdminTab('overview');
      } else if (path.startsWith('/dashboard')) {
        setView('dashboard');
        if (path.includes('/links')) setUserTab('links');
        else if (path.includes('/analytics')) setUserTab('analytics');
        else if (path.includes('/package')) setUserTab('package');
        else if (path.includes('/domains')) setUserTab('domains');
        else setUserTab('shorten');
      } else if (path === '/login') {
        setView('login');
      } else if (path === '/signup') {
        setView('signup');
      } else if (path === '/pricing') {
        setView('pricing');
      } else if (LANDING_PAGES[cleanPath]) {
        setActiveLandingSlug(cleanPath);
        setView('landing');
      } else if (path === '/blog') {
        setView('blog');
      } else if (path.startsWith('/blog/')) {
        const articleSlug = cleanPath.replace('blog/', '');
        if (BLOG_ARTICLES.some(a => a.slug === articleSlug)) {
          setActiveBlogSlug(articleSlug);
          setView('blog-article');
        } else {
          setView('blog');
        }
      } else if (['about', 'contact', 'privacy', 'terms', 'abuse'].includes(cleanPath)) {
        setView(cleanPath);
      }

      // Client-side shortcode redirect interceptor
      const rawPath = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      const knownSpaRoutes = [
        '',
        'dashboard',
        'admin',
        'pricing',
        'api',
        'assets',
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
        'abuse'
      ];

      if (rawPath && !knownSpaRoutes.includes(rawPath.toLowerCase()) && !rawPath.startsWith('blog') && /^[a-zA-Z0-9_-]{3,32}$/.test(rawPath)) {
        setRedirecting(true);
        // 1. Check local storage cache
        try {
          const cached = localStorage.getItem(`boss_link_${rawPath}`);
          if (cached) {
            const item = JSON.parse(cached);
            if (item?.originalUrl) {
              window.location.replace(item.originalUrl);
              return;
            }
          }
        } catch (e) {}

        // 2. Fetch from resolver API via Centralized Api Client
        api.resolveLink(rawPath)
          .then(data => {
            if (data.success && data.originalUrl) {
              window.location.replace(data.originalUrl);
            } else {
              setRedirecting(false);
              setRedirectError(data.error || 'The requested short link does not exist or has expired.');
            }
          })
          .catch(err => {
            setRedirecting(false);
            setRedirectError('Failed to resolve short link: ' + (err.message || 'Error occurred'));
          });
      }

      // Load guest links history from localStorage
      try {
        const cachedGuestLinks = localStorage.getItem('boss_guest_links');
        if (cachedGuestLinks) {
          setGuestLinks(JSON.parse(cachedGuestLinks));
        }
      } catch (e) {}
    }
  }, []);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFbUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          api.setToken(token);
          const meData = await api.me().catch(() => null);
          if (meData && meData.user) {
            setCurrentUser(meData.user);
          } else {
            // Check Firestore for user record
            let userDoc = null;
            try {
              const docRef = doc(db, 'users', user.uid);
              const snap = await getDoc(docRef);
              if (snap.exists()) {
                userDoc = snap.data();
              }
            } catch (e) {
              console.debug('Firestore user lookup skipped:', e);
            }

            const isSystemAdmin = ['mdnasirhassan3@gmail.com', 'mdnasirhassan3.1@gmail.com', 'admin@urlshort.nasirdigitalhub.com'].includes((user.email || '').toLowerCase());

            const resolvedUser: User = {
              id: user.uid,
              email: user.email || '',
              name: user.displayName || userDoc?.name || user.email?.split('@')[0] || 'User',
              role: isSystemAdmin ? 'admin' : (userDoc?.role || 'user'),
              status: userDoc?.status || 'active',
              plan: userDoc?.plan || (isSystemAdmin ? 'enterprise' : 'free'),
              quotaLimit: userDoc?.quotaLimit || (isSystemAdmin ? 100000 : 1000),
              quotaUsed: userDoc?.quotaUsed || 0,
              createdAt: userDoc?.createdAt || user.metadata.creationTime || new Date().toISOString()
            };

            setCurrentUser(resolvedUser);
          }
          loadUserData();
        } catch (err) {
          console.error('Error establishing user session:', err);
        }
      } else {
        api.setToken(null);
        setCurrentUser(null);
        setLinks([]);
        setDomains([]);
        if (view === 'dashboard') {
          const path = window.location.pathname.toLowerCase();
          if (!path.startsWith('/admin') && !path.startsWith('/nachid')) {
            setView('home');
          }
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async () => {
    try {
      const [linksData, domainsData, analyticsData] = await Promise.all([
        api.getLinks().catch(() => ({ links: [] })),
        api.getDomains().catch(() => ({ domains: [] })),
        api.getAnalytics().catch(() => null)
      ]);
      setLinks(linksData.links || []);
      setDomains(domainsData.domains || []);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (e) {
      console.error('Failed to load user records:', e);
    }
  };

  const loadAdminData = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setAdminLoading(true);
    try {
      const [statsRes, usersRes, linksRes, domainsRes, healthRes] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminLinks().catch(() => ({ links: [] })),
        api.getAdminDomains().catch(() => ({ domains: [] })),
        api.getAdminApiHealth().catch(() => null)
      ]);
      setAdminStats(statsRes);
      setAdminUsers(usersRes.users || []);
      setAdminLinks(linksRes.links || []);
      setAdminDomains(domainsRes.domains || []);
      setAdminApiHealth(healthRes);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'admin' && currentUser?.role === 'admin') {
      loadAdminData();
    }
  }, [view, adminTab, currentUser]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;

    if (currentUser && (currentUser.plan === 'inactive' || currentUser.status === 'inactive' || currentUser.status === 'disabled')) {
      setError(lang === 'bn' ? 'ইউআরএল শর্ট করতে আপনার অ্যাকাউন্ট এবং প্ল্যান সক্রিয় থাকা প্রয়োজন। অনুগ্রহ করে প্ল্যান আপডেট বা সক্রিয় করুন।' : 'Your plan or account is inactive. Please activate your plan to shorten URLs.');
      navigateTo('pricing', '/pricing');
      return;
    }

    setLoading(true);
    setError('');
    setCreatedResult(null);

    try {
      const selectedDomain = customDomain || activeHost;
      const res = await api.createLink({
        originalUrl: longUrl,
        customCode: customCode || undefined,
        customDomain: selectedDomain
      });

      setCreatedResult(res.link);
      setLongUrl('');
      setCustomCode('');

      // Cache locally for client-side instant redirect recovery
      try {
        if (res.link?.shortCode) {
          localStorage.setItem(`boss_link_${res.link.shortCode}`, JSON.stringify(res.link));
        }
      } catch (cacheErr) {}

      // Save to guest history if not logged in
      if (!currentUser && res.link) {
        try {
          const stored = localStorage.getItem('boss_guest_links');
          const existing: LinkItem[] = stored ? JSON.parse(stored) : [];
          const updated = [res.link, ...existing.filter(l => l.id !== res.link.id)].slice(0, 50);
          localStorage.setItem('boss_guest_links', JSON.stringify(updated));
          setGuestLinks(updated);
        } catch (cacheErr) {}
      }

      logSafeEvent('short_link_created', {
        domain: selectedDomain,
        has_custom_code: Boolean(customCode)
      });

      if (currentUser) {
        loadUserData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSubmitting(true);

    try {
      const res = await api.adminLogin({
        username: adminUsername,
        password: adminPassword
      });

      if (res.user && res.user.role === 'admin') {
        setCurrentUser(res.user);
        setView('admin');
        navigateTo('admin', '/nachid/admin/dashboard');
        loadAdminData();
      } else {
        setAdminError('Access Denied: Account does not have administrator privileges.');
      }
    } catch (err: any) {
      setAdminError(err.message || 'Invalid administrator username or password.');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleUserLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg('');
    setAuthSubmitting(true);

    try {
      const res = await api.login({ email: authEmail, password: authPassword });
      setCurrentUser(res.user);
      setView('dashboard');
      navigateTo('dashboard', '/dashboard');
      setShowAuthModal(false);
      loadUserData();
    } catch (err: any) {
      setAuthErrorMsg(err.message || 'Login failed. Invalid credentials.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleUserSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg('');
    setAuthSubmitting(true);

    try {
      const res = await api.signup({ email: authEmail, password: authPassword, name: authName });
      setCurrentUser(res.user);
      setView('dashboard');
      navigateTo('dashboard', '/dashboard');
      setShowAuthModal(false);
      loadUserData();
    } catch (err: any) {
      setAuthErrorMsg(err.message || 'Registration failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg('');
    setAuthSuccessMsg('');
    setAuthSubmitting(true);

    try {
      if (authMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        if (authName && cred.user) {
          await updateProfile(cred.user, { displayName: authName });
        }
        // Save user record to Firestore database
        if (cred.user) {
          try {
            await setDoc(doc(db, 'users', cred.user.uid), {
              id: cred.user.uid,
              email: cred.user.email,
              name: authName || cred.user.email?.split('@')[0] || 'User',
              role: 'user',
              status: 'active',
              plan: 'free',
              quotaLimit: 1000,
              quotaUsed: 0,
              createdAt: new Date().toISOString()
            });
          } catch (fsErr) {
            console.warn('Firestore user doc creation error:', fsErr);
          }
        }
        logSafeEvent('sign_up', { method: 'email_password' });
        setShowAuthModal(false);
        setView('dashboard');
        navigateTo('dashboard', '/dashboard');
      } else if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        logSafeEvent('login', { method: 'email_password' });
        setShowAuthModal(false);
        setView('dashboard');
        navigateTo('dashboard', '/dashboard');
      } else if (authMode === 'reset') {
        await sendPasswordResetEmail(auth, authEmail);
        setAuthSuccessMsg('Password reset email sent! Please check your inbox.');
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication error';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered. Please sign in instead.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Incorrect email or password.';
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      setAuthErrorMsg(msg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await api.logout();
    } catch (e) {
      console.warn('Logout note:', e);
    }
    setCurrentUser(null);
    setFbUser(null);
    setView('home');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (redirecting) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} flex flex-col items-center justify-center p-6 text-center`}>
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold tracking-tight mb-1">Redirecting to destination...</h2>
        <p className="text-xs text-slate-400">Boss URL Shortener &bull; High-Performance Engine</p>
      </div>
    );
  }

  if (redirectError) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} flex flex-col items-center justify-center p-6 text-center`}>
        <div className="max-w-md w-full p-8 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl space-y-4">
          <div className="text-rose-500 text-5xl font-extrabold">404</div>
          <h2 className="text-xl font-bold">Link Not Found</h2>
          <p className="text-sm text-slate-400">{redirectError}</p>
          <button
            onClick={() => { setRedirectError(''); window.history.replaceState({}, '', '/'); setView('home'); }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all"
          >
            Go to Boss URL Shortener
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-200`}>
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className={`sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-4 border-b ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <span onClick={() => setView('home')} className="text-lg font-bold tracking-tight cursor-pointer whitespace-nowrap shrink-0">
              {t.brand}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">{activeHost}</span>
              <span className="hidden sm:inline text-indigo-400">· VPS Powered</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium overflow-x-auto py-1">
          <button onClick={() => navigateTo('home', '/')} className={`hover:text-indigo-500 transition-colors whitespace-nowrap shrink-0 ${view === 'home' ? 'text-indigo-500 font-semibold' : 'text-slate-500'}`}>{t.navHome}</button>
          <button onClick={() => navigateTo('landing:free-url-shortener', '/free-url-shortener')} className={`hover:text-indigo-500 transition-colors whitespace-nowrap shrink-0 ${view === 'landing' && activeLandingSlug === 'free-url-shortener' ? 'text-indigo-500 font-semibold' : 'text-slate-500'}`}>Free Shortener</button>
          <button onClick={() => navigateTo('landing:custom-url-shortener', '/custom-url-shortener')} className={`hover:text-indigo-500 transition-colors whitespace-nowrap shrink-0 ${view === 'landing' && activeLandingSlug === 'custom-url-shortener' ? 'text-indigo-500 font-semibold' : 'text-slate-500'}`}>Custom Slugs</button>
          <button onClick={() => navigateTo('blog', '/blog')} className={`hover:text-indigo-500 transition-colors whitespace-nowrap shrink-0 ${view === 'blog' || view === 'blog-article' ? 'text-indigo-500 font-semibold' : 'text-slate-500'}`}>Guides</button>
          <button onClick={() => navigateTo('pricing', '/pricing')} className={`hover:text-indigo-500 transition-colors whitespace-nowrap shrink-0 ${view === 'pricing' ? 'text-indigo-500 font-semibold' : 'text-slate-500'}`}>{t.navPricing}</button>
          {currentUser && (
            <button onClick={() => navigateTo('dashboard', '/dashboard')} className={`hover:text-indigo-500 transition-colors whitespace-nowrap shrink-0 ${view === 'dashboard' ? 'text-indigo-500 font-semibold' : 'text-slate-500'}`}>{t.navDashboard}</button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => navigateTo('admin', '/nachid/admin')}
              className={`hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${view === 'admin' ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.navAdmin}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            title="Switch Language / ভাষা পরিবর্তন করুন"
          >
            <Languages className="w-4 h-4 text-indigo-500" />
            <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg border transition-colors ${theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${currentUser.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                {currentUser.name} {currentUser.role === 'admin' && '★ Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.signOut}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAuthMode('login'); setAuthErrorMsg(''); setAuthSuccessMsg(''); setShowAuthModal(true); }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 shadow-md shadow-indigo-600/20"
            >
              {t.signIn}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Router */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* VIEW 1: LANDING PAGE */}
        {view === 'home' && (
          <div className="space-y-16">
            <SeoHead
              title="URL Shortener - Free Short Link Generator | Boss URL Shortener"
              description="Shorten long URLs instantly with Boss URL Shortener. Create clean, shareable short links and manage your links with easy-to-use tools."
              canonicalPath="/"
              schema={[
                {
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: 'Boss URL Shortener',
                  url: 'https://urlshort.nasirdigitalhub.com/',
                  logo: 'https://urlshort.nasirdigitalhub.com/assets/aistudio/image_0b1e7d27.png'
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'WebSite',
                  name: 'Boss URL Shortener',
                  url: 'https://urlshort.nasirdigitalhub.com/',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://urlshort.nasirdigitalhub.com/free-url-shortener?url={search_term_string}',
                    'query-input': 'required name=search_term_string'
                  }
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'SoftwareApplication',
                  name: 'Boss URL Shortener',
                  applicationCategory: 'UtilitiesApplication',
                  operatingSystem: 'All',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD'
                  }
                }
              ]}
            />
            <div className="text-center max-w-3xl mx-auto pt-12 pb-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Exact Two-Stage URL Shortening with Authoritative VPS Pipeline</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-wrap balance">
                Shorten. Track. Convert at Scale.
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.tagline}. High-speed branded redirects backed by authoritative Boss VPS infrastructure and real-time click analytics.
              </p>

              {/* URL Shortener Form Box */}
              <div className={`p-4 md:p-6 rounded-2xl border shadow-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} text-left space-y-4`}>
                {!currentUser && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span className="font-medium">{lang === 'bn' ? 'কোনো সাইন আপ ছাড়াই সরাসরি ইউআরএল সংক্ষিপ্ত করুন!' : 'Shorten URLs directly without signing up!'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {lang === 'bn' ? 'ইনস্ট্যান্ট অ্যান্ড ফ্রি' : 'Instant & Free'}
                    </span>
                  </div>
                )}

                {currentUser && (currentUser.plan === 'inactive' || currentUser.status === 'inactive' || currentUser.status === 'disabled') && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{lang === 'bn' ? 'আপনার প্ল্যান নিষ্ক্রিয় রয়েছে। ইউআরএল শর্ট করতে প্ল্যান অ্যাক্টিভ করুন।' : 'Your plan is inactive. Please activate your plan to shorten URLs.'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo('pricing', '/pricing')}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      {lang === 'bn' ? 'প্ল্যান অপশন' : 'View Plans'}
                    </button>
                  </div>
                )}

                <form onSubmit={handleShorten} className="space-y-4">
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
                        placeholder={t.shortenPlaceholder}
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
                          <span>{t.shortenBtn}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.customDomainLabel}</label>
                      <select
                        value={customDomain}
                        onChange={e => setCustomDomain(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                      >
                        <option value="urlshort.nasirdigitalhub.com">urlshort.nasirdigitalhub.com (Cloudflare Frontend)</option>
                        <option value="content.org">content.org (Stage 1 Domain)</option>
                        {activeHost !== 'content.org' && activeHost !== 'urlshort.nasirdigitalhub.com' && (
                          <option value={activeHost}>{activeHost} (Current Host)</option>
                        )}
                        {domains.filter(d => d.status === 'verified' && d.domain !== 'content.org' && d.domain !== 'urlshort.nasirdigitalhub.com').map(d => (
                          <option key={d.id} value={d.domain}>{d.domain}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.customCodeLabel}</label>
                      <input
                        type="text"
                        value={customCode}
                        onChange={e => setCustomCode(e.target.value)}
                        placeholder="e.g. launch2026"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
                      />
                    </div>
                  </div>
                </form>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {createdResult && (
                  <div className={`mt-4 p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-200'} space-y-3 animate-fadeIn`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Short link created successfully!</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                        Two-Stage Pipeline Verified
                      </span>
                    </div>

                    {/* Final IP Short URL Result */}
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-medium text-slate-400 mb-0.5 uppercase tracking-wider">Final Short URL (Boss VPS IP Shortener):</div>
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
                          <span>{copied ? t.copySuccess : 'Copy'}</span>
                        </button>
                        <a
                          href={createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          title="Open URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const target = createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl;
                            if (navigator.share) {
                              navigator.share({
                                title: 'Boss URL Shortener',
                                url: target
                              }).catch(() => {});
                            } else {
                              copyToClipboard(target);
                            }
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          title="Share URL"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrModalLink(createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          title="QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stage 1 URL & Target Info */}
                    <div className="pt-1 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-slate-500 font-medium">Stage 1 URL:</span>
                        <code className="text-slate-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 truncate">
                          {createdResult.shortUrl || `https://${createdResult.customDomain || 'content.org'}/${createdResult.shortCode}`}
                        </code>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-slate-500 font-medium">Destination:</span>
                        <span className="text-slate-400 truncate max-w-xs">{createdResult.originalUrl}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guest Shortened Links History */}
              {guestLinks.length > 0 && !currentUser && (
                <div className={`mt-8 p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} space-y-4 text-left`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>{lang === 'bn' ? 'সম্প্রতি তৈরি করা শর্ট লিঙ্কসমূহ (গেস্ট হিষ্ট্রি)' : 'Recently Shortened Links'}</span>
                    </h3>
                    <button
                      onClick={() => {
                        localStorage.removeItem('boss_guest_links');
                        setGuestLinks([]);
                      }}
                      className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      {lang === 'bn' ? 'হিষ্ট্রি ক্লিয়ার করুন' : 'Clear History'}
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {guestLinks.map(gLink => (
                      <div key={gLink.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <a
                            href={gLink.finalUrl || gLink.vpsStage1Url || gLink.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 font-mono font-bold hover:underline truncate block"
                          >
                            {gLink.finalUrl || gLink.vpsStage1Url || gLink.shortUrl}
                          </a>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5" title={gLink.originalUrl}>
                            ➜ {gLink.originalUrl}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(gLink.finalUrl || gLink.vpsStage1Url || gLink.shortUrl)}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrModalLink(gLink.finalUrl || gLink.vpsStage1Url || gLink.shortUrl)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            title="QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="space-y-12 py-12 border-t border-slate-800">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">{t.featuresTitle}</h2>
                <p className="text-slate-400 text-sm">{t.featuresSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                    <Server className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Boss VPS Pipeline</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Integrated directly with authoritative VPS backend at 107.174.37.180 for high-speed Stage 1 resolution and reliable redirects.
                  </p>
                </div>

                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Real-Time Analytics</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Granular click tracking with referrer logs, user-agent parsing, and device metrics without compromising user privacy.
                  </p>
                </div>

                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                  <div className="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Separate RBAC Dashboard</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Strict separation between User Dashboard and Admin Console with server-side authorization and user data isolation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 1.5: SEO INTENT LANDING PAGES */}
        {view === 'landing' && LANDING_PAGES[activeLandingSlug] && (
          <SeoLandingPage
            config={LANDING_PAGES[activeLandingSlug]}
            activeHost={activeHost}
            theme={theme}
            lang={lang}
            onNavigate={navigateTo}
            onOpenQrModal={(url) => setQrModalLink(url)}
            onLinkCreated={(newLink) => {
              if (newLink?.shortCode) {
                try {
                  const stored = localStorage.getItem('boss_guest_links');
                  const existing: LinkItem[] = stored ? JSON.parse(stored) : [];
                  const updated = [newLink, ...existing.filter(l => l.id !== newLink.id)].slice(0, 50);
                  localStorage.setItem('boss_guest_links', JSON.stringify(updated));
                  setGuestLinks(updated);
                } catch (e) {}
              }
            }}
          />
        )}

        {/* VIEW 1.6: TOPICAL AUTHORITY BLOG HUB */}
        {view === 'blog' && (
          <BlogHub
            theme={theme}
            onNavigate={navigateTo}
            onSelectArticle={(slug) => navigateTo(`blog:${slug}`, `/blog/${slug}`)}
          />
        )}

        {/* VIEW 1.7: EDUCATIONAL BLOG ARTICLE */}
        {view === 'blog-article' && (
          (() => {
            const article = BLOG_ARTICLES.find(a => a.slug === activeBlogSlug) || BLOG_ARTICLES[0];
            return (
              <BlogArticlePage
                article={article}
                theme={theme}
                onNavigate={navigateTo}
                onSelectArticle={(slug) => navigateTo(`blog:${slug}`, `/blog/${slug}`)}
              />
            );
          })()
        )}

        {/* VIEW 1.8: TRUST, COMPLIANCE & SUPPORT PAGES */}
        {['about', 'contact', 'privacy', 'terms', 'abuse'].includes(view) && (
          <TrustPages
            pageType={view as any}
            theme={theme}
            onNavigate={navigateTo}
          />
        )}

        {/* VIEW 2: USER DASHBOARD (Restricted to User's Own Records) */}
        {view === 'dashboard' && currentUser && (
          <div className="space-y-8">
            {/* User Dashboard Header & Sub-Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-bold">User Dashboard</h1>
                <p className="text-slate-400 text-xs">Manage your personal short links, view click performance, and request custom domains.</p>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setUserTab('shorten')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${userTab === 'shorten' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.userShortenTab}
                </button>
                <button
                  onClick={() => setUserTab('links')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${userTab === 'links' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.userLinksTab} ({links.length})
                </button>
                <button
                  onClick={() => setUserTab('analytics')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${userTab === 'analytics' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.userAnalyticsTab}
                </button>
                <button
                  onClick={() => setUserTab('domains')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${userTab === 'domains' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.userDomainsTab} ({domains.length})
                </button>
              </div>
            </div>

            {/* TAB A: URL SHORTENER */}
            {userTab === 'shorten' && (
              <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-6 max-w-3xl`}>
                <div>
                  <h2 className="text-lg font-semibold">Create New Two-Stage Short Link</h2>
                  <p className="text-xs text-slate-400">Generates a branded Stage 1 link and validates it with the Boss VPS Stage 2 pipeline.</p>
                </div>
                <form onSubmit={handleShorten} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Destination URL</label>
                    <input
                      type="url"
                      required
                      value={longUrl}
                      onChange={e => setLongUrl(e.target.value)}
                      placeholder="https://example.com/very-long-product-campaign"
                      className={`w-full px-4 py-3 rounded-xl border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">{t.customDomainLabel}</label>
                      <select
                        value={customDomain}
                        onChange={e => setCustomDomain(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                      >
                        <option value="urlshort.nasirdigitalhub.com">urlshort.nasirdigitalhub.com (Cloudflare Frontend)</option>
                        <option value="content.org">content.org (Stage 1 Domain)</option>
                        {activeHost !== 'content.org' && activeHost !== 'urlshort.nasirdigitalhub.com' && (
                          <option value={activeHost}>{activeHost} (Current Host)</option>
                        )}
                        {domains.filter(d => d.status === 'verified' && d.domain !== 'content.org' && d.domain !== 'urlshort.nasirdigitalhub.com').map(d => (
                          <option key={d.id} value={d.domain}>{d.domain}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">{t.customCodeLabel}</label>
                      <input
                        type="text"
                        value={customCode}
                        onChange={e => setCustomCode(e.target.value)}
                        placeholder="e.g. promo2026"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Zap className="w-4 h-4" /><span>{t.shortenBtn}</span></>}
                  </button>
                </form>

                {error && <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg text-xs">{error}</div>}

                {createdResult && (
                  <div className="p-4 rounded-xl border border-indigo-500/30 bg-slate-950 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Short link created successfully!</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                        Two-Stage Pipeline Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800 gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-medium text-slate-400 mb-0.5 uppercase tracking-wider">Final Short URL (Boss VPS IP Shortener):</div>
                        <a
                          href={createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 font-mono text-sm font-bold hover:underline truncate block"
                        >
                          {createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                        <a
                          href={createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                          title="Open URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setQrModalLink(createdResult.finalUrl || createdResult.vpsStage1Url || createdResult.shortUrl)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                          title="QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-800">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-slate-500 font-medium">Stage 1 URL:</span>
                        <code className="text-slate-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 truncate">
                          {createdResult.shortUrl || `https://${createdResult.customDomain || 'content.org'}/${createdResult.shortCode}`}
                        </code>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-slate-500 font-medium">Destination:</span>
                        <span className="text-slate-400 truncate max-w-xs">{createdResult.originalUrl}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB B: MY LINKS */}
            {userTab === 'links' && (
              <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search my links..."
                      className={`w-full pl-9 pr-4 py-2 rounded-lg border text-xs ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <span className="text-xs text-slate-400">My active links: {links.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className={`border-b text-xs uppercase tracking-wider ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                        <th className="p-4">Short Code</th>
                        <th className="p-4">Original Destination</th>
                        <th className="p-4 text-center">Clicks</th>
                        <th className="p-4">Created</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {links.filter(l => l.originalUrl.includes(searchQuery) || l.shortCode.includes(searchQuery)).map(link => (
                        <tr key={link.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <a href={`/${link.shortCode}`} target="_blank" rel="noreferrer" className="font-mono text-indigo-400 hover:underline font-medium">
                              /{link.shortCode}
                            </a>
                          </td>
                          <td className="p-4 max-w-xs truncate text-slate-300" title={link.originalUrl}>
                            {link.originalUrl}
                          </td>
                          <td className="p-4 text-center font-mono font-semibold tabular-nums text-emerald-400">
                            {link.clicks}
                          </td>
                          <td className="p-4 text-xs text-slate-400">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => copyToClipboard(link.finalUrl || `https://urlshort.nasirdigitalhub.com/${link.shortCode}`)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                                title="Copy"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setQrModalLink(link.finalUrl || `https://urlshort.nasirdigitalhub.com/${link.shortCode}`)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                                title="QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  await api.deleteLink(link.id);
                                  loadUserData();
                                }}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-md transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {links.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">
                            No links created yet. Shorten your first URL above!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB C: MY ANALYTICS */}
            {userTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-2`}>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">My Links</span>
                    <div className="text-3xl font-extrabold font-mono tabular-nums text-indigo-400">{links.length}</div>
                  </div>
                  <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-2`}>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">My Total Clicks</span>
                    <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-400">
                      {links.reduce((acc, l) => acc + l.clicks, 0)}
                    </div>
                  </div>
                  <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-2`}>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Account Quota Used</span>
                    <div className="text-3xl font-extrabold font-mono tabular-nums text-violet-400">
                      {currentUser.quotaUsed} / {currentUser.quotaLimit}
                    </div>
                  </div>
                </div>

                {/* Device Breakdown */}
                <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                  <h3 className="text-sm font-semibold">Device Distribution</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-950 rounded-lg">
                      <div className="text-xs text-slate-400">Desktop</div>
                      <div className="text-xl font-bold font-mono text-indigo-400">{analytics?.deviceBreakdown?.desktop || 0}</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-lg">
                      <div className="text-xs text-slate-400">Mobile</div>
                      <div className="text-xl font-bold font-mono text-emerald-400">{analytics?.deviceBreakdown?.mobile || 0}</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-lg">
                      <div className="text-xs text-slate-400">Tablet</div>
                      <div className="text-xl font-bold font-mono text-amber-400">{analytics?.deviceBreakdown?.tablet || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB D: CUSTOM DOMAINS */}
            {userTab === 'domains' && (
              <div className="space-y-6 max-w-3xl">
                <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                  <h2 className="text-lg font-semibold">Request Custom Domain</h2>
                  <p className="text-xs text-slate-400">Submit a domain request. Once reviewed by an administrator, configure the required DNS TXT record to activate.</p>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newDomainInput) return;
                    await api.addDomain({ domain: newDomainInput, intendedUse: newDomainNotes });
                    setNewDomainInput('');
                    setNewDomainNotes('');
                    loadUserData();
                  }} className="space-y-3">
                    <input
                      type="text"
                      required
                      value={newDomainInput}
                      onChange={e => setNewDomainInput(e.target.value)}
                      placeholder="e.g. short.mybrand.com"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                    <input
                      type="text"
                      value={newDomainNotes}
                      onChange={e => setNewDomainNotes(e.target.value)}
                      placeholder="Intended use (e.g. Marketing campaigns, eCommerce)"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm">
                      Submit Domain Request
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold">My Domain Requests</h3>
                  {domains.map(dom => (
                    <div key={dom.id} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono font-medium text-sm text-indigo-400">{dom.domain}</div>
                          <div className="text-xs text-slate-400">{dom.intendedUse || 'No notes provided'}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${dom.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : dom.status === 'approved' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {dom.status}
                        </span>
                      </div>
                      {dom.dnsRecord && (
                        <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 space-y-1">
                          <div className="text-slate-500 text-[11px]">Required DNS Record:</div>
                          <div className="select-all">{dom.dnsRecord}</div>
                        </div>
                      )}
                      {dom.status !== 'verified' && (
                        <button
                          onClick={async () => {
                            const res = await api.verifyDomain(dom.id);
                            alert(res.message);
                            loadUserData();
                          }}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
                        >
                          Check DNS Verification
                        </button>
                      )}
                    </div>
                  ))}
                  {domains.length === 0 && (
                    <p className="text-xs text-slate-500">No custom domains requested yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: DEDICATED ADMIN PANEL (Strictly Protected) */}
        {view === 'admin' && (
          currentUser?.role === 'admin' ? (
            <div className="space-y-8">
              {/* Admin Header & Sub-Nav */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-rose-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      <span>Administrator Console</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-semibold">Strict Admin Area</span>
                    </h1>
                    <p className="text-slate-400 text-xs">Platform governance, user account management, custom domain approvals, and live VPS diagnostics.</p>
                  </div>
                </div>

                {/* Sub-Tabs */}
                <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setAdminTab('overview')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${adminTab === 'overview' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                  >
                    {t.adminOverviewTab}
                  </button>
                  <button
                    onClick={() => setAdminTab('users')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${adminTab === 'users' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                  >
                    {t.adminUsersTab} ({adminUsers.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('links')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${adminTab === 'links' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                  >
                    {t.adminLinksTab} ({adminLinks.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('domains')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${adminTab === 'domains' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                  >
                    {t.adminDomainsTab} ({adminDomains.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('health')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${adminTab === 'health' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{t.adminHealthTab}</span>
                  </button>
                </div>
              </div>

              {/* ADMIN TAB 1: OVERVIEW */}
              {adminTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-2`}>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Registered Users</span>
                      <div className="text-3xl font-extrabold font-mono tabular-nums">{adminStats?.totalUsers || 0}</div>
                      <div className="text-[11px] text-slate-500">Active: {adminStats?.activeUsers || 0} · Disabled: {adminStats?.disabledUsers || 0}</div>
                    </div>
                    <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-2`}>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Platform Links</span>
                      <div className="text-3xl font-extrabold font-mono tabular-nums text-indigo-400">{adminStats?.totalLinks || 0}</div>
                      <div className="text-[11px] text-slate-500">Completed: {adminStats?.completedLinks || 0} · Pending: {adminStats?.pendingLinks || 0}</div>
                    </div>
                    <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-2`}>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Platform Recorded Clicks</span>
                      <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-400">{adminStats?.totalClicks || 0}</div>
                      <div className="text-[11px] text-slate-500">Across all user redirects</div>
                    </div>
                    <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-2`}>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">VPS Node Health</span>
                      <div className="text-xl font-extrabold font-mono text-violet-400 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${adminStats?.vpsHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span>{adminStats?.vpsHealthy ? 'Operational' : 'Degraded'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Latency: {adminStats?.vpsResponseTimeMs || 0}ms</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN TAB 2: USER MANAGEMENT */}
              {adminTab === 'users' && (
                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-sm">All Platform Accounts</h3>
                    <span className="text-xs text-slate-400">Total: {adminUsers.length}</span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase text-slate-400">
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Plan / Quota</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {adminUsers.map(u => (
                        <tr key={u.id}>
                          <td className="p-4">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-300'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.status === 'disabled' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {u.status || 'active'}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-mono">
                            <span className="capitalize">{u.plan}</span> ({u.quotaUsed}/{u.quotaLimit})
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={async () => {
                                  const newRole = u.role === 'admin' ? 'user' : 'admin';
                                  await api.updateAdminUser(u.id, { role: newRole });
                                  loadAdminData();
                                }}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                              >
                                Toggle Role
                              </button>
                              <button
                                onClick={async () => {
                                  const newStatus = u.status === 'disabled' ? 'active' : 'disabled';
                                  await api.updateAdminUser(u.id, { status: newStatus });
                                  loadAdminData();
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-semibold ${u.status === 'disabled' ? 'bg-emerald-600 text-white' : 'bg-rose-600/20 text-rose-400'}`}
                              >
                                {u.status === 'disabled' ? 'Activate' : 'Disable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ADMIN TAB 3: PLATFORM LINKS */}
              {adminTab === 'links' && (
                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Platform-Wide Short Links</h3>
                    <span className="text-xs text-slate-400">Total: {adminLinks.length}</span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase text-slate-400">
                        <th className="p-4">Short Code / Final URL</th>
                        <th className="p-4">Original Destination</th>
                        <th className="p-4">Owner</th>
                        <th className="p-4 text-center">Clicks</th>
                        <th className="p-4 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {adminLinks.map(l => (
                        <tr key={l.id}>
                          <td className="p-4">
                            <div className="font-mono text-indigo-400 font-medium">/{l.shortCode}</div>
                            <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">{l.finalUrl || l.shortUrl}</div>
                          </td>
                          <td className="p-4 max-w-xs truncate text-slate-300" title={l.originalUrl}>{l.originalUrl}</td>
                          <td className="p-4 text-xs text-slate-400 font-mono">{l.userEmail || l.userId}</td>
                          <td className="p-4 text-center font-mono font-semibold text-emerald-400">{l.clicks}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={async () => {
                                await api.deleteAdminLink(l.id);
                                loadAdminData();
                              }}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ADMIN TAB 4: DOMAIN APPROVALS */}
              {adminTab === 'domains' && (
                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4 p-4`}>
                  <h3 className="font-semibold text-sm">Custom Domain Requests Administration</h3>
                  <div className="space-y-4">
                    {adminDomains.map(dom => (
                      <div key={dom.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-sm text-indigo-400 font-bold">{dom.domain}</span>
                            <span className="ml-3 text-xs text-slate-400">Owner: {dom.userEmail || dom.userId}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${dom.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : dom.status === 'approved' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {dom.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Intended Use: {dom.intendedUse || 'No description provided'}</p>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={async () => {
                              await api.updateAdminDomain(dom.id, { status: 'approved' });
                              loadAdminData();
                            }}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              await api.updateAdminDomain(dom.id, { status: 'verified' });
                              loadAdminData();
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                          >
                            Mark Verified
                          </button>
                          <button
                            onClick={async () => {
                              await api.updateAdminDomain(dom.id, { status: 'rejected' });
                              loadAdminData();
                            }}
                            className="px-3 py-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded text-xs font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {adminDomains.length === 0 && (
                      <p className="text-xs text-slate-500">No domain requests pending.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ADMIN TAB 5: DEDICATED API HEALTH MONITORING */}
              {adminTab === 'health' && (
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-6`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <Activity className="w-5 h-5 text-indigo-400" />
                          <span>Authoritative VPS API Live Health Probe</span>
                        </h2>
                        <p className="text-xs text-slate-400">Server-side execution test against VPS at 107.174.37.180.</p>
                      </div>
                      <button
                        onClick={loadAdminData}
                        disabled={adminLoading}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? 'animate-spin' : ''}`} />
                        <span>Run Live Probe</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-xs text-slate-500">Connection Status</div>
                        <div className={`text-lg font-bold font-mono ${adminApiHealth?.vpsOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {adminApiHealth?.vpsOnline ? 'Online (200 OK)' : 'Unreachable'}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-xs text-slate-500">Response Latency</div>
                        <div className="text-lg font-bold font-mono text-indigo-400">
                          {adminApiHealth?.responseTimeMs || 0} ms
                        </div>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-xs text-slate-500">MariaDB Database</div>
                        <div className="text-lg font-bold font-mono text-emerald-400">
                          {adminApiHealth?.databaseReady ? 'Connected' : 'Unavailable'}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-xs text-slate-500">Storage Subsystem</div>
                        <div className="text-lg font-bold font-mono text-emerald-400">
                          {adminApiHealth?.storageReady ? 'Ready' : 'Degraded'}
                        </div>
                      </div>
                    </div>

                    {/* Live JSON Payload Diagnostics */}
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-semibold text-slate-400">Live Backend Response Body (/api/ready):</div>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                        {JSON.stringify(adminApiHealth?.readyData || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto py-8 px-4 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Boss Enterprise Admin Console</h2>
                <p className="text-xs text-slate-400">Restricted Area · Route: /nachid/admin</p>
              </div>

              {currentUser && currentUser.role === 'user' && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs space-y-3">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>User Account Detected</span>
                  </div>
                  <p>You are currently signed in as <strong>{currentUser.email}</strong> (Standard User). Administrator credentials are required to access this console.</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs transition-colors"
                    >
                      Sign Out & Switch
                    </button>
                    <button
                      onClick={() => { setView('dashboard'); navigateTo('dashboard', '/dashboard'); }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Go to User Dashboard
                    </button>
                  </div>
                </div>
              )}

              <div className={`p-6 rounded-2xl border shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Admin Username or Email</label>
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      placeholder="mdnasirhassan3@gmail.com or admin"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Admin Password</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                  </div>

                  {adminError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={adminSubmitting}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {adminSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Sign In to Admin Console</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-3 text-center text-[11px] text-slate-500 border-t border-slate-800/60">
                  Administrator Account: <code>mdnasirhassan3@gmail.com</code> / <code>admin</code>
                </div>
              </div>
            </div>
          )
        )}

        {/* VIEW: USER LOGIN PAGE (/login) */}
        {view === 'login' && (
          <div className="max-w-md mx-auto py-12 px-4 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mx-auto shadow-md">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">User Sign In</h2>
              <p className="text-xs text-slate-400">Access your Boss URL Shortener dashboard & link analytics</p>
            </div>

            <div className={`p-6 rounded-2xl border shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <form onSubmit={handleUserLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="user@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>

                {authErrorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authErrorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {authSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Dashboard</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 text-center text-xs text-slate-400 border-t border-slate-800/60">
                Don't have an account?{' '}
                <button onClick={() => navigateTo('signup', '/signup')} className="text-indigo-400 font-semibold hover:underline">
                  Sign Up Here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: USER SIGNUP PAGE (/signup) */}
        {view === 'signup' && (
          <div className="max-w-md mx-auto py-12 px-4 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mx-auto shadow-md">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Create User Account</h2>
              <p className="text-xs text-slate-400">Start shortening & tracking URLs with enterprise analytics</p>
            </div>

            <div className={`p-6 rounded-2xl border shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <form onSubmit={handleUserSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    placeholder="Nasir Hasan"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="user@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>

                {authErrorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authErrorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {authSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Free Account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 text-center text-xs text-slate-400 border-t border-slate-800/60">
                Already have an account?{' '}
                <button onClick={() => navigateTo('login', '/login')} className="text-indigo-400 font-semibold hover:underline">
                  Sign In Here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: PRICING (Informational & Transparent) */}
        {view === 'pricing' && (
          <div className="space-y-12 py-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight">Transparent Enterprise Pricing</h1>
              <p className="text-slate-400 text-sm">Choose the ideal tier for your business requirements and scaling needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`p-8 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-6 flex flex-col justify-between`}>
                <div className="space-y-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300">Free Tier</span>
                  <div className="text-3xl font-extrabold">$0 <span className="text-xs font-normal text-slate-400">/ forever</span></div>
                  <p className="text-sm text-slate-400">For personal projects and testing short links.</p>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Up to 1,000 links</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Basic click analytics</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Boss VPS stage-1 support</li>
                  </ul>
                </div>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors">
                  Get Started Free
                </button>
              </div>

              <div className={`p-8 rounded-2xl border-2 border-indigo-500 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} space-y-6 flex flex-col justify-between relative shadow-2xl`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400">Pro Business</span>
                  <div className="text-3xl font-extrabold">$29 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                  <p className="text-sm text-slate-400">For scaling growth teams and digital marketers.</p>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 5,000 links quota</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Advanced real-time analytics</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Custom branded domains</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority VPS routing</li>
                  </ul>
                </div>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/30">
                  Upgrade to Pro
                </button>
              </div>

              <div className={`p-8 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-6 flex flex-col justify-between`}>
                <div className="space-y-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/10 text-violet-400">Enterprise</span>
                  <div className="text-3xl font-extrabold">$99 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                  <p className="text-sm text-slate-400">For large organizations with custom infrastructure.</p>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited links</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated VPS cluster</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 99.99% Uptime SLA</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Role-Based Access Control</li>
                  </ul>
                </div>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors">
                  Contact Enterprise Sales
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {qrModalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} space-y-4 text-center relative`}>
            <button onClick={() => setQrModalLink(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold">QR Code</h3>
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrModalLink)}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-xs text-slate-400 font-mono truncate">{qrModalLink}</p>
            <button
              onClick={() => copyToClipboard(qrModalLink)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} space-y-6 relative`}>
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Firebase Authentication</span>
              </div>
              <h2 className="text-2xl font-bold">
                {authMode === 'login' && 'Welcome Back'}
                {authMode === 'signup' && 'Create Your Account'}
                {authMode === 'reset' && t.resetPassword}
              </h2>
              <p className="text-xs text-slate-400">
                {authMode === 'login' && 'Sign in to access your Boss URL dashboard'}
                {authMode === 'signup' && 'Start shortening URLs with enterprise features'}
                {authMode === 'reset' && 'Enter your email to receive a password reset link'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    placeholder="Nasir Hasan"
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              {authMode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-400">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setAuthMode('reset'); setAuthErrorMsg(''); setAuthSuccessMsg(''); }}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        {t.forgotPasswordLink}
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
              )}

              {authErrorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authErrorMsg}</span>
                </div>
              )}

              {authSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{authSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>
                    {authMode === 'login' && 'Sign In'}
                    {authMode === 'signup' && 'Create Account'}
                    {authMode === 'reset' && t.sendResetLink}
                  </span>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 space-y-2">
              {authMode === 'login' && (
                <div>
                  Don't have an account?{' '}
                  <button onClick={() => { setAuthMode('signup'); setAuthErrorMsg(''); setAuthSuccessMsg(''); }} className="text-indigo-400 font-semibold hover:underline">
                    Sign Up
                  </button>
                </div>
              )}
              {authMode === 'signup' && (
                <div>
                  Already have an account?{' '}
                  <button onClick={() => { setAuthMode('login'); setAuthErrorMsg(''); setAuthSuccessMsg(''); }} className="text-indigo-400 font-semibold hover:underline">
                    Sign In
                  </button>
                </div>
              )}
              {authMode === 'reset' && (
                <button onClick={() => { setAuthMode('login'); setAuthErrorMsg(''); setAuthSuccessMsg(''); }} className="text-indigo-400 font-semibold hover:underline">
                  {t.backToLogin}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer
        theme={theme}
        lang={lang}
        onNavigate={navigateTo}
        onToggleLang={() => setLang(lang === 'en' ? 'bn' : 'en')}
      />
    </div>
  );
}
