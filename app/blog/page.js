import Link from 'next/link'
import { ArrowLeft, BookOpen, Clock, Tag, ArrowRight } from 'lucide-react'
import { BLOG_POSTS } from '@/lib/blog'

export const metadata = {
  title: 'Blog \u2014 Learn JSON, XML, YAML, CSV, Base64, JWT & SQL',
  description:
    'Short, practical primers on the data and code formats Code Formatter Pro supports: JSON, XML, YAML, CSV, Base64, JWT, SQL, HTML, CSS and JavaScript.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Code Formatter Pro Blog \u2014 Data & code format primers',
    description:
      'Short, practical primers on every data and code format supported by Code Formatter Pro.',
    url: '/blog',
    type: 'website',
  },
}

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back to Code Formatter Pro
          </Link>
          <span className="text-sm text-slate-500 dark:text-slate-400">{BLOG_POSTS.length} articles</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-14">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm shadow-sm">
            <BookOpen className="w-4 h-4 text-blue-500" /> The Code Formatter Pro Journal
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Short primers on every format we support
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Each article is a 3–4 minute read that explains what a format is, where it is used and how to work with it inside Code Formatter Pro.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readingTime}</span>
                <span>·</span>
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</time>
              </div>
              <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">{post.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                    <Tag className="w-3 h-3" /> {t}
                  </span>
                ))}
              </div>
              <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all">
                Read article <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Code Formatter Pro · Built by{' '}
        <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">NeoWebSolutions</a>
      </footer>
    </div>
  )
}
