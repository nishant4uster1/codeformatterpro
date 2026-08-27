'use client'

import { useState } from 'react'
import { MessageCircle, Mail, Send, ChevronDown } from 'lucide-react'

// WhatsApp destination for the contact form (E.164 without the leading + or spaces).
const WHATSAPP_NUMBER = '919643876061'
// Email destination for the "Send via Email" flow.
const CONTACT_EMAIL = 'hello@northbytelabs.in'
const CATEGORIES = ['Suggestion', 'Complaint', 'Others']

export default function ContactForm() {
  const [method, setMethod] = useState('whatsapp') // 'whatsapp' | 'email'
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('Suggestion')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const clearErr = () => { if (error) setError('') }

  // Phone is optional in both flows — validate only when the user typed something.
  const phoneValid = () => {
    const p = phone.trim()
    if (!p) return true
    const digitCount = (p.match(/\d/g) || []).length
    return /^\+?[\d\s\-()]+$/.test(p) && digitCount >= 7 && digitCount <= 15
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    const trimmedSubject = subject.trim()
    const trimmed = message.trim()

    if (!trimmedName) { setError('Please enter your name.'); return }
    if (!phoneValid()) { setError('Please enter a valid phone number (7–15 digits, e.g. +91 98765 43210) or leave it blank.'); return }
    if (method === 'email' && !trimmedSubject) { setError('Please enter a subject for your email.'); return }
    if (!trimmed) { setError('Please write a short message before sending.'); return }
    setError('')

    if (method === 'email') {
      const bodyLines = [
        `Name: ${trimmedName}`,
        trimmedPhone ? `Phone: ${trimmedPhone}` : null,
        '',
        trimmed,
      ].filter((l) => l !== null)
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(trimmedSubject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`
      window.location.href = mailto
      return
    }

    const text =
      `*Code Formatter Pro — ${category}*\n\n` +
      `*Name:* ${trimmedName}\n` +
      (trimmedPhone ? `*Phone:* ${trimmedPhone}\n` : '') +
      `\n${trimmed}`
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (!win) window.location.href = url
  }

  const isEmail = method === 'email'
  const accent = isEmail
    ? 'from-blue-500 to-indigo-600 shadow-indigo-600/25'
    : 'from-green-500 to-emerald-600 shadow-emerald-600/25'
  const ring = isEmail ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'focus:ring-emerald-500 focus:border-emerald-500'
  const inputBase = `w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition ${ring}`

  return (
    <form
      data-testid="contact-form"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm"
    >
      {/* Method selector */}
      <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6" role="tablist" data-testid="contact-method-tabs">
        <button
          type="button"
          role="tab"
          aria-selected={!isEmail}
          data-testid="contact-method-whatsapp"
          onClick={() => { setMethod('whatsapp'); clearErr() }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${!isEmail ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isEmail}
          data-testid="contact-method-email"
          onClick={() => { setMethod('email'); clearErr() }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${isEmail ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <Mail className="w-4 h-4" /> Email
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}>
          {isEmail ? <Mail className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        </div>
        <div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {isEmail ? 'Send us an email' : 'Message us on WhatsApp'}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {isEmail
              ? `We'll open your mail app with a message to ${CONTACT_EMAIL} pre-filled.`
              : "Pick a category, write your message, and we'll open WhatsApp with it pre-filled."}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Full name
        </label>
        <input
          id="contact-name"
          type="text"
          data-testid="contact-name-input"
          value={name}
          onChange={(e) => { setName(e.target.value); clearErr() }}
          suppressHydrationWarning
          placeholder="Your full name"
          className={inputBase}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Phone number <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="contact-phone"
          type="tel"
          data-testid="contact-phone-input"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); clearErr() }}
          suppressHydrationWarning
          placeholder="e.g. +91 98765 43210"
          className={inputBase}
        />
      </div>

      {isEmail ? (
        <div className="mt-5">
          <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Subject
          </label>
          <input
            id="contact-subject"
            type="text"
            data-testid="contact-subject-input"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); clearErr() }}
            suppressHydrationWarning
            placeholder="What is your email about?"
            className={inputBase}
          />
        </div>
      ) : (
        <div className="mt-5">
          <label htmlFor="contact-category" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Category
          </label>
          <div className="relative">
            <select
              id="contact-category"
              data-testid="contact-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              suppressHydrationWarning
              className={`${inputBase} appearance-none pr-10`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="mt-5">
        <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Detailed message
        </label>
        <textarea
          id="contact-message"
          data-testid="contact-message-input"
          value={message}
          onChange={(e) => { setMessage(e.target.value); clearErr() }}
          rows={6}
          suppressHydrationWarning
          placeholder="Tell us what's on your mind — a feature idea, a bug you hit, or anything else…"
          className={`${inputBase} resize-y`}
        />
        {error && (
          <p data-testid="contact-error" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      <button
        type="submit"
        data-testid="contact-submit-button"
        className={`mt-6 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r ${accent} text-white font-semibold shadow-lg hover:opacity-90 active:scale-[0.98] transition`}
      >
        <Send className="w-4 h-4" />
        {isEmail ? 'Send via Email' : 'Send on WhatsApp'}
      </button>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        {isEmail
          ? 'Clicking the button opens your email app with the message pre-filled. No message is stored on our servers.'
          : 'Clicking the button opens WhatsApp in a new tab. No message is stored on our servers.'}
      </p>
    </form>
  )
}
