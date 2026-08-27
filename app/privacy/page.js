import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Code Formatter Pro handles your data, cookies, ads and privacy. All formatting happens locally in your browser — your data never leaves your device.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy · Code Formatter Pro',
    description: 'How Code Formatter Pro handles your data, cookies, ads and privacy.',
    url: '/privacy',
    type: 'article',
  },
}

const P = ({ children }) => <p className="mt-3 text-slate-600 dark:text-slate-300">{children}</p>
const H = ({ children, id }) => <h2 id={id} className="mt-10 text-2xl font-bold text-slate-900 dark:text-white">{children}</h2>
const H3 = ({ children }) => <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{children}</h3>
const L = ({ children }) => <li className="text-slate-600 dark:text-slate-300">{children}</li>

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
        <P>
          This Privacy Policy explains how <strong>Code Formatter Pro</strong> (the “Service”, “we”, “us”, or “our”),
          operated by <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">NorthByteLabs</a>,
          handles information when you use our website. We are committed to keeping your data safe and being transparent
          about what we do (and don’t do) with it.
        </P>

        <H id="local">1. All formatting happens locally</H>
        <P>
          Code Formatter Pro is a client-side tool. When you paste, upload or type content into any formatter,
          converter, encoder, diff checker or JSON tree viewer, the processing is performed entirely inside
          your own browser. <strong>Your input never leaves your device</strong> and is never transmitted to,
          logged by, or stored on our servers.
        </P>

        <H id="collect">2. Information we collect</H>
        <P>We deliberately keep this list very short:</P>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <L><strong>Local storage on your browser</strong> — theme preference, favorites, recent conversion history and your cookie consent choice. This never leaves your device and can be cleared by you at any time (see §7).</L>
          <L><strong>Standard server logs</strong> — like most websites, our hosting provider records basic request metadata (IP address, user agent, timestamps) for security and abuse prevention. These logs are rotated automatically and are not linked to any individual identity.</L>
          <L><strong>Ad and analytics data (only if you consent)</strong> — see §4.</L>
        </ul>
        <P>We do <strong>not</strong> collect names, email addresses, phone numbers, payment details, or any other personal information. We do not ask you to create an account.</P>

        <H id="purpose">3. How we use information</H>
        <P>The limited data described above is used only to:</P>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <L>Remember your UI preferences so the site behaves consistently between visits.</L>
          <L>Keep the Service secure, stable and free of abuse.</L>
          <L>If you consent, show relevant ads and understand aggregate usage.</L>
        </ul>

        <H id="ads">4. Google AdSense &amp; third-party advertising</H>
        <P>
          To help keep Code Formatter Pro free, we may display ads served by Google AdSense. Ads only load after you
          have <strong>explicitly accepted</strong> cookies via our consent banner. If you decline, no ad or
          measurement scripts are loaded at all.
        </P>
        <P>When ads are enabled, Google and its partners may set cookies or use similar technologies to:</P>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <L>Serve ads based on your prior visits to this site or other sites.</L>
          <L>Measure ad performance and prevent fraud.</L>
        </ul>
        <P>
          You can opt out of personalised advertising at any time from Google’s{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Ads Settings</a>{' '}
          page, or opt out of any third-party vendor’s use of cookies for personalised advertising by visiting{' '}
          <a href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">aboutads.info</a>.
        </P>
        <P>
          Google’s own privacy practices are documented at{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">policies.google.com/technologies/ads</a>.
        </P>

        <H id="cookies">5. Cookies</H>
        <P>See our full <Link href="/cookies" className="text-blue-600 dark:text-blue-400 underline">Cookie Policy</Link> for the exact cookies and local-storage keys we use and how to disable them.</P>

        <H id="sharing">6. Sharing your data</H>
        <P>
          We do not sell, rent or trade any information about our users. The only third parties that may receive
          data are:
        </P>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <L>Our hosting/CDN provider (limited to standard server logs).</L>
          <L>Google, if and only if you have accepted ad cookies (§4).</L>
        </ul>

        <H id="rights">7. Your rights (GDPR / CCPA)</H>
        <P>
          You do not need to contact us to exercise any rights over the data we collect, because the vast majority
          of it stays inside your own browser. At any time you can:
        </P>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <L><strong>Withdraw or change your cookie consent</strong> by clearing your browser’s local storage for this site, or by using the button below.</L>
          <L><strong>Delete stored preferences, favorites and history</strong> using the “Clear history” / “Unpin” buttons inside the app, or by clearing local storage.</L>
          <L><strong>Opt out of personalised ads</strong> as described in §4.</L>
        </ul>
        <P>
          If you have specific privacy questions, contact us via{' '}
          <a href="https://northbytelabs.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
            NorthByteLabs
          </a>.
        </P>

        <H id="children">8. Children</H>
        <P>The Service is not directed at children under 13. We do not knowingly collect information from children.</P>

        <H id="changes">9. Changes to this policy</H>
        <P>
          We may update this policy from time to time. Material changes will be communicated through a notice on
          the site. Continued use of the Service after such changes constitutes acceptance of the revised policy.
        </P>

        <H id="contact">10. Contact</H>
        <P>
          Questions? Reach the team behind Code Formatter Pro at{' '}
          <a href="https://northbytelabs.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
            NorthByteLabs
          </a>.
        </P>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Code Formatter Pro · Built by{' '}
        <a href="https://northbytelabs.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">NorthByteLabs</a>
      </footer>
    </div>
  )
}
