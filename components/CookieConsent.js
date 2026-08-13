'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, Check, X } from 'lucide-react'
import { ADSENSE_CLIENT } from '@/lib/ads'

/**
 * GDPR-style cookie consent banner.
 *   - "Accept all"  → stores localStorage.cf-consent = 'accepted' AND loads the
 *                     Google AdSense loader script.
 *   - "Reject non-essential" → stores 'rejected' and NEVER loads ad scripts.
 *
 * A custom event `cf-consent-changed` is dispatched so <AdSlot /> components
 * refresh their state without a page reload.
 */
const CookieConsent = () => {
  const [state, setState] = useState('unknown') // 'unknown' | 'accepted' | 'rejected'

  useEffect(() => {
    try {
      const v = localStorage.getItem('cf-consent') || 'unknown'
      setState(v === 'accepted' || v === 'rejected' ? v : 'unknown')
      if (v === 'accepted') loadAdsScript()
    } catch {}
  }, [])

  const loadAdsScript = () => {
    if (!ADSENSE_CLIENT) return
    if (document.querySelector('script[data-adsense-loader]')) return
    const s = document.createElement('script')
    s.async = true
    s.crossOrigin = 'anonymous'
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
    s.setAttribute('data-adsense-loader', '1')
    document.head.appendChild(s)
  }

  const accept = () => {
    try { localStorage.setItem('cf-consent', 'accepted') } catch {}
    setState('accepted')
    loadAdsScript()
    window.dispatchEvent(new Event('cf-consent-changed'))
  }
  const reject = () => {
    try { localStorage.setItem('cf-consent', 'rejected') } catch {}
    setState('rejected')
    window.dispatchEvent(new Event('cf-consent-changed'))
  }

  if (state !== 'unknown') return null

  return (
    <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-4 md:left-auto md:max-w-md z-50">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900 dark:text-white">We value your privacy</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Code Formatter Pro uses cookies to remember your theme, favorites and history — and, if you accept, to
              show relevant ads via Google AdSense. All formatting happens locally in your browser.{' '}
              <Link href="/cookies" className="underline underline-offset-2 text-blue-600 dark:text-blue-400">
                Cookie policy
              </Link>{' '}
              ·{' '}
              <Link href="/privacy" className="underline underline-offset-2 text-blue-600 dark:text-blue-400">
                Privacy policy
              </Link>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={accept}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition"
              >
                <Check className="w-4 h-4" /> Accept all
              </button>
              <button
                onClick={reject}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" /> Reject non-essential
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
