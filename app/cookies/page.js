import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ResetConsentButton from '@/components/ResetConsentButton'

export const metadata = {
  title: 'Cookie Policy',
  description: 'Full list of cookies and local-storage keys Code Formatter Pro uses, and how to control them. All formatting happens locally in your browser.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Cookie Policy · Code Formatter Pro',
    description: 'Full list of cookies and local-storage keys Code Formatter Pro uses, and how to control them.',
    url: '/cookies',
    type: 'article',
  },
}

const P = ({ children }) => <p className="mt-3 text-slate-600 dark:text-slate-300">{children}</p>
const H = ({ children }) => <h2 className="mt-10 text-2xl font-bold text-slate-900 dark:text-white">{children}</h2>

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Code Formatter Pro
          </Link>
          <div className="text-sm text-slate-500 dark:text-slate-400">Last updated: 2 June 2025</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 text-[17px] leading-relaxed">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Cookie Policy</h1>
        <P>
          This page lists every cookie and local-storage key Code Formatter Pro can set on your device, what each one
          does, and how you can control them. For a broader explanation of data handling see the{' '}
          <Link href="/privacy" className="text-blue-600 dark:text-blue-400 underline">Privacy Policy</Link>.
        </P>

        <H>1. Strictly necessary (always active)</H>
        <P>These preferences are stored in your browser via <em>localStorage</em>. They never leave your device.</P>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              <tr><th className="text-left px-4 py-2">Key</th><th className="text-left px-4 py-2">Purpose</th><th className="text-left px-4 py-2">Lifetime</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr><td className="px-4 py-2 mono">cf-theme</td><td className="px-4 py-2">Remembers the light/dark theme you chose.</td><td className="px-4 py-2">Until cleared</td></tr>
              <tr><td className="px-4 py-2 mono">cf-favorites</td><td className="px-4 py-2">Stores the list of tools you have pinned to the top of the sidebar.</td><td className="px-4 py-2">Until cleared</td></tr>
              <tr><td className="px-4 py-2 mono">cf-history</td><td className="px-4 py-2">Keeps the last 8 tool runs so you can jump back to previous work.</td><td className="px-4 py-2">Until cleared</td></tr>
              <tr><td className="px-4 py-2 mono">cf-consent</td><td className="px-4 py-2">Records whether you accepted or rejected the cookie banner.</td><td className="px-4 py-2">Until cleared</td></tr>
            </tbody>
          </table>
        </div>

        <H>2. Advertising (only if you accept)</H>
        <P>
          If you accept our banner, Google AdSense will load and may set cookies (for example <code className="mono">__gads</code>,{' '}
          <code className="mono">__gpi</code>, <code className="mono">IDE</code>, <code className="mono">NID</code>) used to serve, cap
          and measure ads. Google&apos;s full list is documented at{' '}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
            policies.google.com/technologies/cookies
          </a>. If you reject the banner, these scripts are never loaded and these cookies are never set.
        </P>

        <H>3. Managing cookies</H>
        <P>You can control cookies at any time:</P>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-300">
          <li>Reset your consent choice with the button below — the banner will reappear next time you visit.</li>
          <li>Clear all local-storage keys via your browser&apos;s DevTools (Application → Storage → Local Storage).</li>
          <li>Block third-party cookies globally in your browser settings.</li>
          <li>Use a tracker-blocking extension of your choice — the site remains fully functional without them.</li>
        </ul>

        <ResetConsentButton />

        <H>4. Contact</H>
        <P>
          Any questions about cookies? Reach us at{' '}
          <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
            neowebsolutions.netlify.app
          </a>.
        </P>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Code Formatter Pro · Built by{' '}
        <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">NeoWebSolutions</a>
      </footer>
    </div>
  )
}
