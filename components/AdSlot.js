'use client'

import { useEffect, useRef, useState } from 'react'
import { ADSENSE_CLIENT, AD_SLOTS, hasConsent } from '@/lib/ads'

/**
 * Reusable Google AdSense slot.
 *
 * Usage:  <AdSlot slot="hero" />   or   <AdSlot slot="sidebar" format="rectangle" />
 *
 * Props:
 *   - slot: key from AD_SLOTS in /app/lib/ads.js (hero | sidebar | inContent | footer)
 *   - format: adsense ad format (default "auto")
 *   - className: extra classes on the wrapper
 *
 * Behaviour:
 *   • Renders nothing until (a) the user has accepted cookies AND (b) ADSENSE_CLIENT is set.
 *   • In development, if a slot ID is missing, a labeled placeholder is shown instead.
 *   • Listens for the "cf-consent-changed" custom event so consent flips take effect live.
 */
const AdSlot = ({ slot = 'hero', format = 'auto', className = '', style }) => {
  const [consent, setConsent] = useState(false)
  const [pushed, setPushed] = useState(false)
  const ref = useRef(null)
  const slotId = AD_SLOTS[slot] || ''

  useEffect(() => {
    setConsent(hasConsent())
    const onChange = () => setConsent(hasConsent())
    window.addEventListener('cf-consent-changed', onChange)
    return () => window.removeEventListener('cf-consent-changed', onChange)
  }, [])

  useEffect(() => {
    if (!consent || !ADSENSE_CLIENT || !slotId || pushed) return
    try {
      // eslint-disable-next-line no-undef
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      setPushed(true)
    } catch (e) {
      // AdSense may not be ready on first render — try again shortly.
      const t = setTimeout(() => {
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); setPushed(true) } catch {}
      }, 800)
      return () => clearTimeout(t)
    }
  }, [consent, slotId, pushed])

  // Dev / setup helper: placeholder when slot not configured
  if (!ADSENSE_CLIENT || !slotId) {
    return (
      <div className={`w-full max-w-full min-w-0 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-sm text-center p-4 break-words ${className}`}>
        <div className="font-semibold uppercase tracking-wider text-xs mb-1">Ad slot · {slot}</div>
        <div className="break-all">Configure <code className="mono break-all">NEXT_PUBLIC_ADSENSE_CLIENT</code> and <code className="mono break-all">NEXT_PUBLIC_ADSENSE_SLOT_{slot.toUpperCase()}</code> in <code className="mono">.env</code> to display ads here.</div>
      </div>
    )
  }
  if (!consent) return null

  return (
    <div className={`w-full ${className}`}>
      <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 text-center">Advertisement</div>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

export default AdSlot
