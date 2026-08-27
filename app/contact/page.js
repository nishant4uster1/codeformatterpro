import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContactForm from '@/components/ContactForm'

export const metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Code Formatter Pro. Send us a Suggestion, report a Complaint, or reach out about anything else — your message opens directly in WhatsApp.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us · Code Formatter Pro',
    description:
      'Send a Suggestion, Complaint or general message to the Code Formatter Pro team via WhatsApp.',
    url: '/contact',
    type: 'website',
  },
}

// ContactPage-specific JSON-LD helps search engines surface the contact route.
const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Code Formatter Pro',
  description:
    'Reach the Code Formatter Pro team with a suggestion, complaint or general enquiry via WhatsApp.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />

      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white" data-testid="contact-back-home">
            <ArrowLeft className="w-4 h-4" /> Back to Code Formatter Pro
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Contact Us</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-slate-600 dark:text-slate-300">
          Have a feature idea, spotted a bug, or just want to say hello? Choose WhatsApp or Email,
          write your message, and we&apos;ll open it pre-filled so you can send it straight to the team.
        </p>

        <div className="mt-8">
          <ContactForm />
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Code Formatter Pro · Built by{' '}
        <a href="https://northbytelabs.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">NorthByteLabs</a>
      </footer>
    </div>
  )
}
