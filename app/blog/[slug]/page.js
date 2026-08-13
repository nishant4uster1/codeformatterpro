import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Tag, ArrowRight } from 'lucide-react'
import { BLOG_POSTS, getPostBySlug } from '@/lib/blog'

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Article not found' }
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} \u00b7 Code Formatter Pro`,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    keywords: post.tags.join(', '),
    author: { '@type': 'Organization', name: 'NeoWebSolutions', url: 'https://neowebsolutions.netlify.app/' },
    publisher: { '@type': 'Organization', name: 'Code Formatter Pro' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `/blog/${post.slug}` },
  }

  const related = (post.related || []).map(getPostBySlug).filter(Boolean)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> All articles
          </Link>
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Open Code Formatter Pro →</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-slate-800 dark:hover:text-slate-200">Home</Link></li>
            <li>›</li>
            <li><Link href="/blog" className="hover:text-slate-800 dark:hover:text-slate-200">Blog</Link></li>
            <li>›</li>
            <li className="text-slate-700 dark:text-slate-200 truncate">{post.title}</li>
          </ol>
        </nav>

        <article className="mt-6">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readingTime}</span>
            <span>·</span>
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">{post.title}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{post.excerpt}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                <Tag className="w-3 h-3" /> {t}
              </span>
            ))}
          </div>

          <div className="mt-10 space-y-8">
            {post.content.map((sec, i) => (
              <section key={i}>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{sec.h}</h2>
                <p className="mt-3 text-[17px] leading-relaxed text-slate-700 dark:text-slate-300">{sec.p}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-slate-900 dark:to-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white">Try it in Code Formatter Pro</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Every tool mentioned in this article runs entirely inside your browser — no signup, no uploads.</p>
            <Link href="/" className="mt-3 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:gap-2 transition-all">
              Open the toolkit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>

        {related.length > 0 && (
          <aside className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Related articles</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="block p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition">
                  <div className="text-xs text-slate-500 dark:text-slate-400">{r.readingTime}</div>
                  <div className="mt-1 font-semibold text-slate-900 dark:text-white">{r.title}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{r.excerpt}</div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Code Formatter Pro · Built by{' '}
        <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">NeoWebSolutions</a>
      </footer>
    </div>
  )
}
