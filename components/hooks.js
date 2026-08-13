'use client'

import { useCallback, useEffect, useState } from 'react'

// Tiny wrapper around localStorage that never throws (Safari private mode,
// disabled storage, quota exceeded). All hooks below share these helpers so
// the pattern isn't repeated in every consumer.
const safeGet = (key) => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null } catch { return null }
}
const safeSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota / disabled — swallow */ }
}
const safeRemove = (key) => { try { localStorage.removeItem(key) } catch { /* noop */ } }

const HISTORY_KEY = 'cf-history'
const FAVORITES_KEY = 'cf-favorites'
const THEME_KEY = 'cf-theme'
const HISTORY_LIMIT = 8

/**
 * useHistory — keeps the last N (default 8) "tool + input" pairs the user
 * has run, mirrored to localStorage so they survive a reload.
 */
export const useHistory = () => {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = safeGet(HISTORY_KEY)
    if (Array.isArray(saved)) setHistory(saved)
  }, [])

  const saveHistory = useCallback((toolId, input) => {
    if (!input || !input.trim()) return
    setHistory((h) => {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        toolId,
        input: input.slice(0, 4000),
        ts: Date.now(),
      }
      const dedup = h.filter((x) => !(x.toolId === toolId && x.input === entry.input))
      const next = [entry, ...dedup].slice(0, HISTORY_LIMIT)
      safeSet(HISTORY_KEY, next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    safeRemove(HISTORY_KEY)
  }, [])

  return { history, saveHistory, clearHistory }
}

/**
 * useFavorites — persists the set of pinned tool IDs.
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const saved = safeGet(FAVORITES_KEY)
    if (Array.isArray(saved)) setFavorites(saved)
  }, [])

  const toggleFavorite = useCallback((toolId) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId) ? prev.filter((x) => x !== toolId) : [...prev, toolId]
      safeSet(FAVORITES_KEY, next)
      return next
    })
  }, [])

  return { favorites, toggleFavorite }
}

/**
 * useDarkMode — reads the initial class from <html> (already set by the
 * boot-time script in layout.js) and toggles it on demand, persisting the
 * user's choice under cf-theme.
 */
export const useDarkMode = () => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = useCallback(() => {
    setDark((d) => {
      const next = !d
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next)
      }
      safeSet(THEME_KEY, next ? 'dark' : 'light')
      return next
    })
  }, [])

  return { dark, toggleTheme }
}

/**
 * useClipboardFlag — small helper that flips a boolean flag on for `ms`
 * milliseconds after a successful copy. Handles both the modern async
 * clipboard API and the legacy execCommand('copy') fallback.
 */
export const useClipboardFlag = (ms = 1500) => {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text) => {
    if (text === undefined || text === null) return false
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCopied(true); setTimeout(() => setCopied(false), ms)
        return true
      }
    } catch { /* fall through */ }
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'; ta.style.left = '-9999px'
      ta.setAttribute('readonly', '')
      document.body.appendChild(ta); ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      if (ok) { setCopied(true); setTimeout(() => setCopied(false), ms) }
      return ok
    } catch { return false }
  }, [ms])

  return { copied, copy }
}
