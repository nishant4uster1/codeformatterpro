// Next.js App Router automatically serves this at /sitemap.xml
// SEO-friendly per Google Search Central guidance: include every canonical
// URL, an accurate lastmod, and appropriate changeFrequency/priority hints.

import { BLOG_POSTS } from '@/lib/blog'

export const dynamic = 'force-static'

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codeformatterpro.com'
  const now = new Date()

  const staticEntries = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ]

  const blogEntries = BLOG_POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticEntries, ...blogEntries]
}
