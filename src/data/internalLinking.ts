export interface InternalLinkRegistry {
  keyword: string;
  targetUrl: string;
  description: string;
}

export const INTERNAL_LINKING_REGISTRY: InternalLinkRegistry[] = [
  { keyword: 'URL shortener', targetUrl: '/url-shortener', description: 'Main utility landing page' },
  { keyword: 'free URL shortener', targetUrl: '/free-url-shortener', description: 'Free intent tool' },
  { keyword: 'link shortener', targetUrl: '/link-shortener', description: 'General link utility' },
  { keyword: 'custom URL shortener', targetUrl: '/custom-url-shortener', description: 'Feature page for custom slugs' },
  { keyword: 'branded URL shortener', targetUrl: '/branded-url-shortener', description: 'Feature page for domains' },
  { keyword: 'short URL generator', targetUrl: '/short-url-generator', description: 'General tool' },
  { keyword: 'QR code generator', targetUrl: '/qr-code-generator', description: 'Feature page for QR' },
  { keyword: 'bulk URL shortener', targetUrl: '/bulk-url-shortener', description: 'Feature page for batch' },
  { keyword: 'click analytics', targetUrl: '/url-shortener-with-analytics', description: 'Analytics feature' },
  { keyword: 'Knowledge Hub', targetUrl: '/blog', description: 'Blog hub' }
];

export function autoLinkContent(text: string): string {
  let linkedText = text;
  INTERNAL_LINKING_REGISTRY.forEach(link => {
    // Regex to find keyword with word boundaries, case-insensitive
    const regex = new RegExp(`\\b(${link.keyword})\\b`, 'gi');
    linkedText = linkedText.replace(regex, `<a href="${link.targetUrl}" class="text-indigo-400 hover:underline font-medium">$1</a>`);
  });
  return linkedText;
}
