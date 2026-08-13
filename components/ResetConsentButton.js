'use client'
import { RotateCcw } from 'lucide-react'
import { useState } from 'react'

export default function ResetConsentButton() {
  const [done, setDone] = useState(false)
  const handle = () => {
    try { localStorage.removeItem('cf-consent') } catch {}
    setDone(true)
    setTimeout(() => (window.location.href = '/'), 800)
  }
  return (
    <div className="mt-6">
      <button onClick={handle} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition">
        <RotateCcw className="w-4 h-4" /> {done ? 'Reset — reloading…' : 'Reset my cookie consent'}
      </button>
    </div>
  )
}
