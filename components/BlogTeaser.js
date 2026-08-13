'use client'

import Link from 'next/link'
import { BookOpen, ExternalLink } from 'lucide-react'
import { BLOG_POSTS } from '@/lib/blog'

/**
 * Small strip on the home page that surfaces the three most recent blog
 * posts, links out to the full /blog index, and matches the site's card
 * styling. Rendered inline so no dynamic import is needed.
 */
const BlogTeaser = () => {
  const posts = BLOG_POSTS.slice(0, 3)
  if (!posts.length) return null

  return (
    <section id="blog" className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Latest from the blog
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Short primers on the formats we support
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-2xl">
              Quick reads on JSON, XML, YAML, CSV, Base64, JWT and more — perfect when you need a refresher before pasting your data.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-semibold hover:opacity-90 transition"
          >
            View all articles <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition flex flex-col"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">{p.readingTime}</div>
              <div className="mt-1 font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                {p.title}
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{p.excerpt}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogTeaser
