// Next.js App Router automatically serves this at /robots.txt
// Follows Google's Search Central guidance: allow crawling everywhere except
// API and internal Next.js paths, and point to the sitemap.
// https://developers.google.com/search/docs/crawling-indexing/robots/intro

export const dynamic = 'force-static'

export default function robots() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codeformatterpro.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/'],
      },
      // Give major SEO / SEO-friendly bots explicit access.
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
