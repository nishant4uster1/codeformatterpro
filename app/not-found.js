import Link from 'next/link'

export const metadata = {
  title: 'Page not found · Code Formatter Pro',
  description: 'The page you are looking for does not exist. Return to Code Formatter Pro\u2019s free online formatting and conversion tools.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-lg text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-300">
          Error 404
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          The tools you love are still one click away.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl transition">
            Go to Code Formatter Pro home
          </Link>
          <Link href="/privacy" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            Privacy Policy
          </Link>
        </div>
        <ul className="mt-10 grid sm:grid-cols-2 gap-3 text-left text-sm">
          {[
            { href: '/#tools', label: 'JSON Formatter' },
            { href: '/#tools', label: 'XML to JSON Converter' },
            { href: '/#tools', label: 'Base64 Encoder / Decoder' },
            { href: '/#tools', label: 'Diff Checker' },
          ].map((x) => (
            <li key={x.label}>
              <Link href={x.href} className="block px-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition text-slate-700 dark:text-slate-200">
                {x.label} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
