export interface LandingPageConfig {
  slug: string;
  path: string;
  title: string;
  metaDescription: string;
  h1: string;
  subheading: string;
  badgeText: string;
  toolMode: 'standard' | 'free' | 'custom' | 'branded' | 'analytics' | 'bulk' | 'qr';
  heroBenefit: string;
  introParagraph: string;
  keyFeatures: { title: string; description: string; icon: string }[];
  howItWorks: { step: number; title: string; description: string }[];
  useCases: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  ctaHeading: string;
  ctaSubtext: string;
}

export const LANDING_PAGES: Record<string, LandingPageConfig> = {
  'url-shortener': {
    slug: 'url-shortener',
    path: '/url-shortener',
    title: 'URL Shortener - Fast, Clean & Reliable Link Generator | Boss',
    metaDescription: 'Use the Boss URL Shortener to create fast, compact, high-converting short links. Powered by an authoritative VPS backend with instant redirects.',
    h1: 'Professional URL Shortener for Modern Creators & Businesses',
    subheading: 'Turn long, cluttered web addresses into clean, powerful short URLs with two-stage VPS verification and real-time tracking.',
    badgeText: 'Primary URL Shortening Tool',
    toolMode: 'standard',
    heroBenefit: 'Zero-friction link shortening with instant clipboard copy and QR code download.',
    introParagraph: 'Boss URL Shortener delivers ultra-low-latency link redirects backed by dedicated VPS infrastructure. Whether you are running multichannel marketing campaigns, posting to social media, or streamlining internal documentation, our platform makes link management effortless.',
    keyFeatures: [
      {
        title: 'Two-Stage VPS Pipeline',
        description: 'Every shortened link is processed through our authoritative VPS architecture for maximum uptime and instant redirection.',
        icon: 'Zap'
      },
      {
        title: 'Real-Time Click Tracking',
        description: 'Measure performance with instant click counts, device analytics, and referrer breakdown without compromising visitor privacy.',
        icon: 'BarChart2'
      },
      {
        title: 'Custom Branded Domains',
        description: 'Connect your own custom domain name to reinforce brand trust on every link you share.',
        icon: 'Globe'
      }
    ],
    howItWorks: [
      { step: 1, title: 'Paste Your Long URL', description: 'Enter any valid destination URL including query parameters into the shortener.' },
      { step: 2, title: 'Customize Your Alias', description: 'Optionally choose a memorable custom slug or branded domain.' },
      { step: 3, title: 'Share & Track', description: 'Copy your compact short link or download the generated QR code.' }
    ],
    useCases: [
      { title: 'Social Media Posts', description: 'Keep your Twitter/X, Instagram, and LinkedIn posts clean, readable, and under character limits.' },
      { title: 'Email & SMS Campaigns', description: 'Prevent awkward link line breaks and reduce SMS message segment costs.' },
      { title: 'Affiliate Marketing', description: 'Cloak messy affiliate URLs into clean, recognizable vanity links.' }
    ],
    faqs: [
      { question: 'What is a URL shortener?', answer: 'A URL shortener is an online service that turns long web addresses into compact links that redirect automatically to the destination.' },
      { question: 'Is Boss URL Shortener free to use?', answer: 'Yes! You can shorten links immediately on this page without creating an account or paying any fees.' },
      { question: 'Do short links expire?', answer: 'Active, compliant links created on Boss URL Shortener do not expire.' }
    ],
    ctaHeading: 'Ready to Shorten Your First URL?',
    ctaSubtext: 'Paste your long link above to experience enterprise-grade link shortening in under two seconds.'
  },

  'free-url-shortener': {
    slug: 'free-url-shortener',
    path: '/free-url-shortener',
    title: 'Free URL Shortener - Shorten Links with No Signup Required | Boss',
    metaDescription: '100% free URL shortener. No registration, no login, and no credit card required. Generate clean short links and instant QR codes in seconds.',
    h1: 'Free URL Shortener — No Signup or Account Required',
    subheading: 'Shorten any link instantly for free. Get compact, clickable links with zero paywalls, zero ads, and zero registration friction.',
    badgeText: '100% Free · No Registration Required',
    toolMode: 'free',
    heroBenefit: 'Instant link generation without an email address or password. Paste and go.',
    introParagraph: 'Most URL shorteners force you through tedious signup forms before giving you a link. Boss Free URL Shortener eliminates friction entirely: simply paste your web address below to receive an instant, permanently active short link with free QR code support.',
    keyFeatures: [
      {
        title: 'No Registration Required',
        description: 'Shorten links immediately. No email, no password, and no credit card needed.',
        icon: 'CheckCircle2'
      },
      {
        title: 'Local Link History',
        description: 'Your recently shortened guest links are automatically stored in your browser so you can retrieve them anytime.',
        icon: 'Clock'
      },
      {
        title: 'Free QR Codes',
        description: 'Every shortened link comes with an instant, high-contrast QR code ready for download and print.',
        icon: 'QrCode'
      }
    ],
    howItWorks: [
      { step: 1, title: 'Paste Long Link', description: 'Paste your target destination directly into the free shortener field.' },
      { step: 2, title: 'Click Shorten', description: 'Our system creates your short URL in milliseconds.' },
      { step: 3, title: 'Copy & Share', description: 'Your short link is immediately ready to paste into emails, chats, or social media.' }
    ],
    useCases: [
      { title: 'Quick Sharing in Chats', description: 'Send clean links over WhatsApp, Slack, or Telegram without cluttering conversation threads.' },
      { title: 'Student & Research Projects', description: 'Share survey links and academic sources cleanly in presentations and documents.' },
      { title: 'Ad-Hoc Event Promotions', description: 'Generate instant links and QR codes for one-off webinars and meetups.' }
    ],
    faqs: [
      { question: 'Are there any hidden costs or trial periods?', answer: 'None. Guest URL shortening on Boss is permanently free with no credit card or account requirement.' },
      { question: 'Can I view links I created as a guest?', answer: 'Yes! Your guest shortened links are saved in your local browser history right below the tool.' }
    ],
    ctaHeading: 'Create Your Free Short Link Right Now',
    ctaSubtext: 'No login required. Just paste your link above and enjoy instant shortening.'
  },

  'link-shortener': {
    slug: 'link-shortener',
    path: '/link-shortener',
    title: 'Link Shortener - Clean, Compact & Shareable Links | Boss',
    metaDescription: 'Transform long web links into compact, shareable URLs with our intuitive link shortener. Clean links optimized for mobile apps, SMS, and social media.',
    h1: 'Fast Link Shortener for Clean, Clickable Web Links',
    subheading: 'Cut unwieldy URLs down to size. Deliver clean, aesthetic web links that look great on any screen and boost engagement.',
    badgeText: 'High-Speed Link Reducer',
    toolMode: 'standard',
    heroBenefit: 'Engineered for optimal link aesthetics and mobile click-through rates.',
    introParagraph: 'A long link with dozens of tracking parameters looks messy and suspicious to users. Our link shortener cleans up the clutter, leaving you with an elegant, compact URL that users click with confidence.',
    keyFeatures: [
      {
        title: 'Aesthetic Clean Links',
        description: 'Remove visible tracking query bloat while preserving full redirection accuracy.',
        icon: 'Sparkles'
      },
      {
        title: 'Mobile-Optimized Routing',
        description: 'Fast HTTP 302 redirects ensure instant page rendering on mobile Safari and Chrome.',
        icon: 'Zap'
      },
      {
        title: 'Built-in Sharing Tools',
        description: 'One-click copy, native Web Share API integration, and QR code generation.',
        icon: 'Share2'
      }
    ],
    howItWorks: [
      { step: 1, title: 'Enter Destination', description: 'Insert your long URL into the link shortener input.' },
      { step: 2, title: 'Generate Compact Link', description: 'Click shorten to initiate the two-stage VPS link verification.' },
      { step: 3, title: 'Distribute Across Channels', description: 'Share the link via SMS, social media, or email newsletters.' }
    ],
    useCases: [
      { title: 'SMS Text Broadcasts', description: 'Save critical character space and avoid split message charges.' },
      { title: 'Podcast Mentions', description: 'Share short, memorable links that listeners can easily type.' },
      { title: 'YouTube Video Descriptions', description: 'Keep your description box tidy and organized with uniform short links.' }
    ],
    faqs: [
      { question: 'What makes a link shortener different from a URL shortener?', answer: 'They refer to the same core technology; our platform provides both simple string reduction and advanced enterprise analytics.' }
    ],
    ctaHeading: 'Shorten Any Link in Seconds',
    ctaSubtext: 'Test the link shortener above with any long web address.'
  },

  'short-url-generator': {
    slug: 'short-url-generator',
    path: '/short-url-generator',
    title: 'Short URL Generator - Instant Link Redirection Engine | Boss',
    metaDescription: 'Generate short URLs instantly with our high-speed short URL generator. Reliable redirection engine powered by Boss VPS and Cloudflare Edge.',
    h1: 'Instant Short URL Generator with Edge Redirection',
    subheading: 'Convert any lengthy URL into a high-performance short web link powered by distributed edge caching and dedicated VPS infrastructure.',
    badgeText: 'High-Availability URL Generator',
    toolMode: 'standard',
    heroBenefit: 'Sub-30ms redirect latency powered by distributed edge caching.',
    introParagraph: 'Speed matters. When someone clicks your link, a delay of even 500 milliseconds increases bounce rates. The Boss Short URL Generator leverages distributed edge caching and an authoritative VPS backend to deliver the fastest redirect speeds in the industry.',
    keyFeatures: [
      {
        title: 'Sub-30ms Latency',
        description: 'Optimized routing infrastructure delivers near-instant redirection anywhere in the world.',
        icon: 'Zap'
      },
      {
        title: 'Two-Stage Verification',
        description: 'Every URL is validated before generation to prevent broken redirects and 404 dead ends.',
        icon: 'Shield'
      },
      {
        title: 'High Concurrency',
        description: 'Engineered to handle high-traffic spikes from viral social posts or major email campaigns.',
        icon: 'Server'
      }
    ],
    howItWorks: [
      { step: 1, title: 'Input Web Address', description: 'Paste your web link into the generator.' },
      { step: 2, title: 'Edge Processing', description: 'The engine hashes and indexes your URL in our edge database.' },
      { step: 3, title: 'Instant Live Link', description: 'Your short URL is live globally and ready for high-traffic distribution.' }
    ],
    useCases: [
      { title: 'Viral Social Campaigns', description: 'Handle tens of thousands of simultaneous clicks without breaking a sweat.' },
      { title: 'Product Launches', description: 'Direct early access visitors smoothly to your launch page.' }
    ],
    faqs: [
      { question: 'How fast are the redirects?', answer: 'Redirects typically execute in under 30 milliseconds thanks to edge cache optimization.' }
    ],
    ctaHeading: 'Generate Your High-Speed Short URL',
    ctaSubtext: 'Experience the fastest link generation engine online today.'
  },

  'custom-url-shortener': {
    slug: 'custom-url-shortener',
    path: '/custom-url-shortener',
    title: 'Custom URL Shortener - Personalized Short Links & Slugs | Boss',
    metaDescription: 'Create custom short links with personalized slugs and vanity back-halves. Increase click-through rates by up to 34% with Boss Custom URL Shortener.',
    h1: 'Custom URL Shortener with Vanity Slugs & Aliases',
    subheading: 'Replace random letters and numbers with recognizable, branded custom slugs that build trust and dramatically increase clicks.',
    badgeText: 'Vanity Slugs & Custom Aliases',
    toolMode: 'custom',
    heroBenefit: 'Boost link engagement by up to 34% by giving users full context before they click.',
    introParagraph: 'Random alphanumeric codes like `/8xKq9` look impersonal and trigger caution in cautious internet users. With our Custom URL Shortener, you can choose custom back-halves like `/spring-deals` or `/webinar-signup` that explain exactly what awaits the visitor.',
    keyFeatures: [
      {
        title: 'Custom Vanity Slugs',
        description: 'Personalize the tail-end of your links with your chosen keywords, brand names, or dates.',
        icon: 'Key'
      },
      {
        title: 'Duplicate Slug Prevention',
        description: 'Instant conflict resolution ensures your custom alias is exclusively assigned to your destination.',
        icon: 'Check'
      },
      {
        title: 'Brand Recall Boost',
        description: 'Memorable custom links are easy to recite verbally on podcasts, video streams, and phone calls.',
        icon: 'Sparkles'
      }
    ],
    howItWorks: [
      { step: 1, title: 'Enter Destination', description: 'Paste the original URL you wish to direct users toward.' },
      { step: 2, title: 'Choose Your Custom Slug', description: 'Type your custom alias into the "Custom Short Code" input (e.g. launch2026).' },
      { step: 3, title: 'Publish Your Custom Link', description: 'Generate and share your branded vanity URL immediately.' }
    ],
    useCases: [
      { title: 'Podcast & Radio Mentions', description: 'Give listeners an easy URL to remember and type from memory.' },
      { title: 'Event Registration', description: 'Create clean links like `/summit2026` for flyers and conference badges.' },
      { title: 'Promo Codes', description: 'Align your vanity link directly with your promo code (e.g. `/save20`).' }
    ],
    faqs: [
      { question: 'Can I use hyphens and numbers in my custom slug?', answer: 'Yes! You can use letters, numbers, and hyphens to create clean, readable slugs.' },
      { question: 'Is custom slug generation free?', answer: 'Yes, custom slugs are available for both guest and registered users on Boss URL Shortener.' }
    ],
    ctaHeading: 'Create Your Custom Vanity Link Now',
    ctaSubtext: 'Choose your custom alias in the form above and claim your unique link.'
  },

  'branded-url-shortener': {
    slug: 'branded-url-shortener',
    path: '/branded-url-shortener',
    title: 'Branded URL Shortener - Custom Domain Links | Boss Shortener',
    metaDescription: 'Connect your own domain name to create 100% branded short links. Elevate brand recognition, establish trust, and eliminate third-party domain clutter.',
    h1: 'Branded URL Shortener: Connect Your Custom Domain',
    subheading: 'Stop building brand equity for generic shortener domains. Connect your custom domain (like brand.link) and make every shared link 100% yours.',
    badgeText: 'Custom Domain & Enterprise Branding',
    toolMode: 'branded',
    heroBenefit: 'Transform every link you share into a branded marketing asset.',
    introParagraph: 'When you share generic shortener links, you promote another company’s brand name. A branded URL shortener allows you to connect your own domain (e.g., `links.yourcompany.com` or `yourbrand.co`), reinforcing your business identity on every social post, email, and ad campaign.',
    keyFeatures: [
      {
        title: 'Custom Domain Mapping',
        description: 'Easily connect your domain via simple DNS TXT and CNAME verification records.',
        icon: 'Globe'
      },
      {
        title: 'Automatic SSL Certificates',
        description: 'All connected branded domains automatically receive secure HTTPS encryption.',
        icon: 'Shield'
      },
      {
        title: 'Brand Protection & Trust',
        description: 'Eliminate visitor hesitation by showing your verified business domain on every link.',
        icon: 'CheckCircle2'
      }
    ],
    howItWorks: [
      { step: 1, title: 'Submit Your Domain', description: 'Submit your custom domain via the dashboard for verification.' },
      { step: 2, title: 'Configure DNS Records', description: 'Add a simple DNS TXT or CNAME record to verify domain ownership.' },
      { step: 3, title: 'Start Generating Branded Links', description: 'Select your branded domain from the dropdown whenever creating links.' }
    ],
    useCases: [
      { title: 'Enterprise Organizations', description: 'Maintain strict brand compliance and link governance across all departments.' },
      { title: 'Marketing Agencies', description: 'Manage branded links for multiple client domains in a single unified dashboard.' },
      { title: 'E-commerce Brands', description: 'Deliver branded order tracking and discount links that look authentic to shoppers.' }
    ],
    faqs: [
      { question: 'How do I add my custom domain?', answer: 'Log into your account, visit the Custom Domains tab in the Dashboard, enter your domain name, and follow the simple DNS instructions.' },
      { question: 'Does it support subdomains?', answer: 'Yes! You can connect root domains or dedicated subdomains like links.yourbrand.com.' }
    ],
    ctaHeading: 'Elevate Your Brand with Custom Domains',
    ctaSubtext: 'Start shortening links today and connect your custom domain in the dashboard.'
  },

  'url-shortener-with-analytics': {
    slug: 'url-shortener-with-analytics',
    path: '/url-shortener-with-analytics',
    title: 'URL Shortener with Real-Time Analytics & Click Tracking | Boss',
    metaDescription: 'Track link clicks in real time with comprehensive analytics. Monitor referrer sources, device breakdowns, browser telemetry, and campaign ROI.',
    h1: 'URL Shortener with Real-Time Click Analytics',
    subheading: 'Gain deep, actionable intelligence on your audience with granular click logs, referrer sources, and device distribution metrics.',
    badgeText: 'Actionable Link Intelligence',
    toolMode: 'analytics',
    heroBenefit: 'Make data-driven marketing decisions with real-time click and referrer telemetry.',
    introParagraph: 'Every click tells a story. Boss URL Shortener goes beyond link reduction to provide a real-time analytics suite. Discover exactly which marketing channels deliver paying customers, which devices your audience uses, and when your traffic peaks.',
    keyFeatures: [
      {
        title: 'Live Click Counters',
        description: 'Watch click counters update in real time as your audience engages with your content.',
        icon: 'Activity'
      },
      {
        title: 'Referrer Traffic Attribution',
        description: 'Identify top traffic sources including Google, Facebook, Twitter/X, and direct messaging.',
        icon: 'BarChart2'
      },
      {
        title: 'Device & Browser Breakdown',
        description: 'Analyze distribution across Desktop, Mobile, and Tablet devices to optimize landing page experiences.',
        icon: 'Layers'
      }
    ],
    howItWorks: [
      { step: 1, title: 'Shorten Your Link', description: 'Create your trackable short link on our platform.' },
      { step: 2, title: 'Deploy in Campaigns', description: 'Share your link in emails, social posts, or ad creatives.' },
      { step: 3, title: 'Inspect Real-Time Data', description: 'Open your analytics dashboard to monitor clicks and referrer channels live.' }
    ],
    useCases: [
      { title: 'Ad Campaign Optimization', description: 'Determine which ad creative generates the highest click volume before scaling budget.' },
      { title: 'Influencer Tracking', description: 'Measure the exact traffic each creator sends to your store.' },
      { title: 'A/B Test Evaluation', description: 'Compare click-through rates between different headlines and calls-to-action.' }
    ],
    faqs: [
      { question: 'How quickly do clicks appear in the analytics?', answer: 'Click events are processed and displayed in real time within seconds of the user click.' },
      { question: 'Is the tracking privacy compliant?', answer: 'Yes. We respect GDPR and CCPA guidelines by aggregating data and anonymizing visitor IPs.' }
    ],
    ctaHeading: 'Track Every Link with Precision',
    ctaSubtext: 'Generate your trackable link above and unlock full analytics inside the dashboard.'
  },

  'bulk-url-shortener': {
    slug: 'bulk-url-shortener',
    path: '/bulk-url-shortener',
    title: 'Bulk URL Shortener - Shorten Multiple URLs at Once | Boss',
    metaDescription: 'Shorten dozens of long URLs simultaneously with our fast bulk URL shortener tool. Batch process links and copy or export all results in seconds.',
    h1: 'Bulk URL Shortener: Batch Convert Multiple Links',
    subheading: 'Stop shortening links one by one. Paste up to 20 URLs at once and generate clean short links in a single click.',
    badgeText: 'Batch Productivity Tool',
    toolMode: 'bulk',
    heroBenefit: 'Save hours of repetitive manual work by batch shortening multiple URLs simultaneously.',
    introParagraph: 'Managing marketing spreadsheets or catalog product links one URL at a time is tedious. The Boss Bulk URL Shortener accepts a list of multiple web addresses, processes each through our two-stage pipeline, and returns a clean list of shortened URLs ready to copy in one click.',
    keyFeatures: [
      {
        title: 'Multi-URL Processing',
        description: 'Paste up to 20 URLs separated by line breaks and process them all in parallel.',
        icon: 'Layers'
      },
      {
        title: 'One-Click Batch Copy',
        description: 'Copy all generated short links at once to paste directly into your spreadsheet or campaign tool.',
        icon: 'Copy'
      },
      {
        title: 'Automated Validation',
        description: 'Detects and flags invalid URLs before processing to ensure all generated links work properly.',
        icon: 'CheckSquare'
      }
    ],
    howItWorks: [
      { step: 1, title: 'Paste URL List', description: 'Enter multiple long URLs, one per line, into the bulk shortener box.' },
      { step: 2, title: 'Click Batch Shorten', description: 'Our system processes each link concurrently through the VPS pipeline.' },
      { step: 3, title: 'Copy All Results', description: 'Copy all generated short links with a single click.' }
    ],
    useCases: [
      { title: 'E-commerce Catalog Sharing', description: 'Batch shorten product links for email promotions or social shopping feeds.' },
      { title: 'Affiliate Spreadsheets', description: 'Quickly convert entire tables of raw affiliate links into clean branded URLs.' },
      { title: 'Event Material Preparation', description: 'Generate short links for multiple speaker bios, workshop slides, and handouts.' }
    ],
    faqs: [
      { question: 'How many URLs can I shorten at once?', answer: 'You can paste up to 20 URLs at a time in the free bulk shortener tool.' },
      { question: 'Do all bulk shortened links support analytics?', answer: 'Yes! Each generated short link is tracked individually with full click analytics.' }
    ],
    ctaHeading: 'Batch Shorten Your Links Today',
    ctaSubtext: 'Paste your list of URLs below to generate all your short links in seconds.'
  },

  'qr-code-generator': {
    slug: 'qr-code-generator',
    path: '/qr-code-generator',
    title: 'Free QR Code URL Generator - Short Link to QR Code | Boss',
    metaDescription: 'Generate free, high-resolution QR codes from any web link or short URL. Instant scanning, high contrast, and print-ready downloads with Boss Shortener.',
    h1: 'Free QR Code URL Generator for Print & Digital Media',
    subheading: 'Convert any long or short URL into a high-contrast, easily scannable QR code. Perfect for product packaging, flyers, restaurant menus, and events.',
    badgeText: 'High-Resolution QR Generator',
    toolMode: 'qr',
    heroBenefit: 'Clean low-density QR codes that scan instantly from any smartphone camera.',
    introParagraph: 'Generating a QR code from a long, complex 120-character URL produces a dense, cluttered pattern that frequently fails to scan on older phone cameras. By pairing our URL shortener with a built-in QR generator, we compress the underlying data into a clean, low-density QR code that scans instantly from several feet away.',
    keyFeatures: [
      {
        title: 'High-Contrast Scannability',
        description: 'Engineered with optimized error correction to guarantee rapid scans under diverse lighting.',
        icon: 'QrCode'
      },
      {
        title: 'Integrated Shortening',
        description: 'Automatically shortens the link before encoding to keep QR patterns clean and legible.',
        icon: 'Zap'
      },
      {
        title: 'Print-Ready Asset',
        description: 'Scan on screen with any smartphone or download for your graphic design layouts.',
        icon: 'ExternalLink'
      }
    ],
    howItWorks: [
      { step: 1, title: 'Enter Your Link', description: 'Paste the destination web link you want your QR code to open.' },
      { step: 2, title: 'Instant QR Encoding', description: 'Our tool generates a clean short link and renders your QR code immediately.' },
      { step: 3, title: 'Test & Download', description: 'Scan the preview with your smartphone to verify, then save the QR code.' }
    ],
    useCases: [
      { title: 'Restaurant Menus & Table Tents', description: 'Provide diners with contactless digital menu access.' },
      { title: 'Conference Badges & Slides', description: 'Let attendees scan your slides to download presentation decks or contact info.' },
      { title: 'Retail Product Packaging', description: 'Direct shoppers to product manuals, video guides, and warranty registration.' }
    ],
    faqs: [
      { question: 'Do these QR codes expire?', answer: 'No. The QR codes encode permanent short links that remain active indefinitely.' },
      { question: 'Can I track scans from the QR code?', answer: 'Yes! Every scan is recorded as a link click in your Boss URL Shortener analytics dashboard.' }
    ],
    ctaHeading: 'Generate Your Free QR Code Now',
    ctaSubtext: 'Paste any URL into the tool above to generate an instant, scannable QR code.'
  }
};
