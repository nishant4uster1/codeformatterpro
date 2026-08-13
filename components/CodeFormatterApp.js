'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { TOOLS, CATEGORIES } from '@/lib/tools'
import DiffChecker from '@/components/DiffChecker'
import JsonTree from '@/components/JsonTree'
import CronTool from '@/components/CronTool'
import AdSlot from '@/components/AdSlot'
import CookieConsent from '@/components/CookieConsent'
import SeoContent from '@/components/SeoContent'
import BlogTeaser from '@/components/BlogTeaser'
import { NumberedTextarea, NumberedOutput } from '@/components/NumberedPanels'
import { useHistory, useFavorites, useDarkMode, useClipboardFlag } from '@/components/hooks'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import yamlLang from 'highlight.js/lib/languages/yaml'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'
import sqlLang from 'highlight.js/lib/languages/sql'
import plaintext from 'highlight.js/lib/languages/plaintext'
import {
  Search, Copy, Check, Eraser, Play, Sparkles, Braces, Code2, FileCode2,
  ArrowLeftRight, LockKeyhole, Type, Wand2, ExternalLink, Zap, Shield, Rocket,
  Upload, Download, Sun, Moon, Share2, History, Trash2, Star, BookOpen,
  AlertCircle, Menu, X, PanelLeftClose, PanelLeftOpen, AlignJustify,
} from 'lucide-react'

hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yamlLang)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('sql', sqlLang)
hljs.registerLanguage('plaintext', plaintext)

const CATEGORY_ICONS = {
  Favorites: Star,
  Formatters: Braces,
  Minifiers: FileCode2,
  Converters: ArrowLeftRight,
  'Encoders / Decoders': LockKeyhole,
  'Text Tools': Type,
  Generators: Wand2,
  'Viewers & Utilities': Sparkles,
}
const CATEGORY_COLORS = {
  Favorites: 'from-amber-400 to-yellow-500',
  Formatters: 'from-blue-500 to-cyan-500',
  Minifiers: 'from-emerald-500 to-teal-500',
  Converters: 'from-violet-500 to-fuchsia-500',
  'Encoders / Decoders': 'from-amber-500 to-orange-500',
  'Text Tools': 'from-rose-500 to-pink-500',
  Generators: 'from-indigo-500 to-purple-500',
  'Viewers & Utilities': 'from-sky-500 to-indigo-500',
}

// The two "viewer" tools are React components rather than pure functions,
// so they are declared here and merged with the pure-function tools registry.
const EXTRA_TOOLS = [
  { id: 'diff-check', name: 'Diff Checker', category: 'Viewers & Utilities', desc: 'Compare two texts and highlight every difference including trailing spaces and tabs.', special: true },
  { id: 'json-tree', name: 'JSON Tree Viewer', category: 'Viewers & Utilities', desc: 'Explore nested JSON as a collapsible tree.', special: true },
  { id: 'cron-tool', name: 'Cron Job Builder', category: 'Viewers & Utilities', desc: 'Build a cron schedule with simple controls and decode any cron expression into plain English.', special: true },
]
const ALL_CATEGORIES = [...CATEGORIES, 'Viewers & Utilities']
const ALL_TOOLS = [...TOOLS, ...EXTRA_TOOLS]

// Above this input size we take the "big file" path: skip syntax
// highlighting, skip history persistence, skip URL-share encoding, and
// stretch the auto-run debounce so typing/pasting stays fluid.
const LARGE_INPUT_THRESHOLD = 200_000 // ~200 KB
// URLs above ~50 KB become unwieldy in most browsers/back-ends.
const SHARE_URL_LIMIT = 50_000

const highlightCode = (code, lang) => {
  if (!code) return ''
  try {
    const language = ['json', 'xml', 'yaml', 'javascript', 'css', 'sql'].includes(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language, ignoreIllegals: true }).value
  } catch {
    return code.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  }
}

// Encode / decode input for the shareable URL hash. Uses base64url so the
// link stays copy-paste-safe in Slack, email, etc.
const encodeShareInput = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const decodeShareInput = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))

const App = () => {
  const [activeId, setActiveId] = useState('json-format')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [errorLine, setErrorLine] = useState(null)
  const [query, setQuery] = useState('')
  const [running, setRunning] = useState(false)
  const [showShared, setShowShared] = useState(false)
  const [csvDelimiter, setCsvDelimiter] = useState(',')
  const [blankLines, setBlankLines] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const fileRef = useRef(null)

  const { history, saveHistory, clearHistory } = useHistory()
  const { favorites, toggleFavorite } = useFavorites()
  const { dark, toggleTheme } = useDarkMode()

  const copyIn = useClipboardFlag()
  const copyOutTop = useClipboardFlag()
  const copyOutBot = useClipboardFlag()
  const copyShare = useClipboardFlag(2500)

  const activeTool = useMemo(() => ALL_TOOLS.find((t) => t.id === activeId), [activeId])

  // Parse a shared link on load and again on hashchange so users returning
  // to the tab with a new hash see the new tool/input immediately.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const loadFromHash = () => {
      try {
        const h = window.location.hash
        if (!h || h.length < 2) return
        const params = new URLSearchParams(h.slice(1))
        const t = params.get('t')
        const d = params.get('d')
        if (t && ALL_TOOLS.find((x) => x.id === t)) {
          setActiveId(t)
          setInput(d ? decodeShareInput(d) : '')
          setShowShared(true)
          setTimeout(() => setShowShared(false), 3500)
        }
      } catch (e) { console.warn('share hash parse failed', e) }
    }
    loadFromHash()
    window.addEventListener('hashchange', loadFromHash)
    return () => window.removeEventListener('hashchange', loadFromHash)
  }, [])

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? ALL_TOOLS.filter((t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.desc.toLowerCase().includes(q),
        )
      : ALL_TOOLS
    const g = { Favorites: [] }
    for (const c of ALL_CATEGORIES) g[c] = []
    const favSet = new Set(favorites)
    for (const t of filtered) {
      if (favSet.has(t.id)) g.Favorites.push(t)
      ;(g[t.category] ||= []).push(t)
    }
    return g
  }, [query, favorites])

  const CATS_WITH_FAV = useMemo(
    () => (favorites.length > 0 ? ['Favorites', ...ALL_CATEGORIES] : ALL_CATEGORIES),
    [favorites],
  )

  const XML_BLOCK_TOOLS = ['xml-format', 'xml-mini']
  const runOptions = useMemo(() => {
    if (activeId === 'csv-to-json') return { delimiter: csvDelimiter }
    if (XML_BLOCK_TOOLS.includes(activeId)) return { blankLines }
    return undefined
  }, [activeId, csvDelimiter, blankLines])

  // Debounced auto-run on tool / input / options change. Cancellation via a
  // local flag prevents a slower earlier run from overwriting a fresher one.
  // The debounce stretches for large inputs so typing stays responsive.
  useEffect(() => {
    if (!activeTool || activeTool.special) return
    if (!input && activeTool.id !== 'gen-uuid' && activeTool.id !== 'gen-ts') {
      setOutput(''); setError(''); setErrorLine(null); return
    }
    let cancelled = false
    setRunning(true)
    const delay = input.length > LARGE_INPUT_THRESHOLD ? 900 : 400
    const t = setTimeout(async () => {
      try {
        const res = await activeTool.run(input, runOptions)
        if (cancelled) return
        setOutput(res ?? ''); setError(''); setErrorLine(null)
        // Skip history for very large inputs — localStorage quota is ~5 MB total
        // and one huge entry would evict the rest of the user's activity.
        if (input && input.trim() && input.length < LARGE_INPUT_THRESHOLD) {
          saveHistory(activeTool.id, input)
        }
      } catch (e) {
        if (cancelled) return
        setOutput(''); setError(e.message || String(e)); setErrorLine(e && e.line ? e.line : null)
      } finally {
        if (!cancelled) setRunning(false)
      }
    }, delay)
    return () => { cancelled = true; clearTimeout(t) }
  }, [input, activeTool, saveHistory, runOptions])

  const handleLoadSample = () => {
    if (activeTool?.sample !== undefined) setInput(activeTool.sample)
  }

  const handleRun = async () => {
    if (!activeTool) return
    setRunning(true)
    try {
      const res = await activeTool.run(input, runOptions)
      setOutput(res ?? ''); setError(''); setErrorLine(null)
    } catch (e) {
      setOutput(''); setError(e.message || String(e)); setErrorLine(e && e.line ? e.line : null)
    } finally { setRunning(false) }
  }

  const clearInput = () => { setInput(''); setOutput(''); setError(''); setErrorLine(null) }
  const clearOutput = () => { setOutput(''); setError(''); setErrorLine(null) }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setInput(String(ev.target?.result || ''))
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDownload = () => {
    if (!output) return
    const ext = activeTool?.ext || 'txt'
    const mimeMap = {
      json: 'application/json', xml: 'application/xml', html: 'text/html', css: 'text/css',
      js: 'application/javascript', yaml: 'application/x-yaml', csv: 'text/csv',
      sql: 'application/sql', txt: 'text/plain',
    }
    const blob = new Blob([output], { type: mimeMap[ext] || 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTool?.id || 'output'}.${ext}`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
  }

  // Skip syntax highlighting for very large outputs — hljs.highlight is
  // O(n) but its tokenisation choke on multi-MB output. The <NumberedOutput>
  // component falls back to plain escaped text when html is empty.
  const outputHtml = useMemo(() => {
    if (!output || output.length > LARGE_INPUT_THRESHOLD) return ''
    return highlightCode(output, activeTool?.outLang)
  }, [output, activeTool])

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !activeTool) return ''
    // Very large inputs can't fit in a URL fragment — offer a tool-only link.
    if (input && input.length > SHARE_URL_LIMIT) {
      try {
        const base = `${window.location.origin}${window.location.pathname}`
        return `${base}#t=${encodeURIComponent(activeTool.id)}`
      } catch { return '' }
    }
    try {
      const enc = input ? encodeShareInput(input) : ''
      const base = `${window.location.origin}${window.location.pathname}`
      return `${base}#t=${encodeURIComponent(activeTool.id)}${enc ? `&d=${enc}` : ''}`
    } catch { return '' }
  }, [activeTool, input])

  const handleShare = async () => {
    if (!shareUrl) return
    const ok = await copyShare.copy(shareUrl)
    if (ok) { try { window.history.replaceState(null, '', shareUrl) } catch {} }
  }

  const loadFromHistory = (item) => { setActiveId(item.toolId); setInput(item.input) }

  return (
    <div className="min-h-screen transition-colors bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Top ribbon */}
      <div className="w-full bg-slate-900 text-slate-100 dark:bg-black text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Website built by
            <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 inline-flex items-center gap-1">
              NeoWebSolutions <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </span>
          <span className="opacity-80 hidden sm:inline">100% free · Runs entirely in your browser · No data leaves your device</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-xl font-bold gradient-text truncate">Code Formatter Pro</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Format · Convert · Minify · Encode</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-5 text-slate-600 dark:text-slate-300 text-[15px]">
            <a href="#tools" className="hover:text-slate-900 dark:hover:text-white transition">Tools</a>
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition">Features</a>
            <Link href="/blog" className="hover:text-slate-900 dark:hover:text-white transition inline-flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Blog
            </Link>
            <a href="#about" className="hover:text-slate-900 dark:hover:text-white transition">About</a>
            <button suppressHydrationWarning onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>
          <div className="md:hidden flex items-center gap-1">
            <button suppressHydrationWarning onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Menu" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 text-slate-700 dark:text-slate-200">
              <a href="#tools" onClick={() => setMobileMenuOpen(false)} className="py-1">Tools</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1">Features</a>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="py-1 inline-flex items-center gap-1"><BookOpen className="w-4 h-4" /> Blog</Link>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1">About</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>40+ developer tools · Zero installation</span>
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Your all-in-one <span className="gradient-text">Code Formatter Pro</span> toolkit
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Beautify, minify, validate and convert every popular data & code format — JSON, XML, YAML, CSV, HTML, CSS,
            JavaScript, SQL, Base64, JWT and more. Instant results, gorgeous UI, and everything runs privately in your browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#tools" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-[1.02] transition">
              <Rocket className="w-5 h-5" /> Open Tools
            </a>
            <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <BookOpen className="w-5 h-5" /> Read the Blog
            </Link>
          </div>

          <div id="features" className="mt-14 grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
            {[
              { icon: Zap, title: 'Blazing fast', desc: 'Auto-run on every keystroke with an efficient debounced engine.' },
              { icon: Shield, title: 'Private by design', desc: 'All formatting happens locally — your data never leaves the tab.' },
              { icon: Sparkles, title: 'Beautiful output', desc: 'Syntax-highlighted, copyable results in light or dark mode.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools workspace */}
      <section id="tools" className="max-w-7xl mx-auto px-4 pb-20">
        <AdSlot slot="hero" className="mb-6" />

        <div className={`grid gap-6 ${sidebarCollapsed ? 'lg:grid-cols-[68px_1fr]' : 'lg:grid-cols-[280px_1fr]'}`}>
          {/* Collapsed sidebar — thin icon-only strip */}
          {sidebarCollapsed ? (
            <aside data-testid="sidebar-collapsed" className="hidden lg:flex bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-2 h-fit lg:sticky lg:top-24 flex-col items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(false)}
                data-testid="sidebar-expand-btn"
                aria-label="Expand tools sidebar"
                title="Expand tools"
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 my-1" />
              {CATS_WITH_FAV.map((cat) => {
                const items = grouped[cat] || []
                if (!items.length) return null
                const Icon = CATEGORY_ICONS[cat]
                const hasActive = items.some((t) => t.id === activeId)
                return (
                  <button
                    key={cat}
                    onClick={() => setSidebarCollapsed(false)}
                    title={cat}
                    aria-label={cat}
                    data-testid={`sidebar-collapsed-cat-${cat}`}
                    className={`p-1.5 rounded-xl transition ${hasActive ? 'ring-2 ring-blue-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[cat]} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </button>
                )
              })}
            </aside>
          ) : (
          /* Sidebar */
          <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-3 h-fit lg:sticky lg:top-24 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tools</div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                data-testid="sidebar-collapse-btn"
                aria-label="Collapse tools sidebar"
                title="Collapse sidebar"
                className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="tool-scroll max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1 space-y-4">
              {CATS_WITH_FAV.map((cat) => {
                const items = grouped[cat] || []
                if (!items.length) return null
                const Icon = CATEGORY_ICONS[cat]
                return (
                  <div key={cat} className="min-w-0">
                    <div className="flex items-center gap-2 px-1 mb-1.5">
                      <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${CATEGORY_COLORS[cat]} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{cat}</div>
                    </div>
                    <ul className="space-y-1">
                      {items.map((t) => {
                        const isFav = favorites.includes(t.id)
                        const isActive = activeId === t.id
                        return (
                          <li key={cat + '-' + t.id} className="min-w-0">
                            <div className={`group flex items-center gap-1 rounded-lg transition min-w-0 ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 shadow shadow-blue-600/30'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}>
                              <button
                                onClick={() => { setActiveId(t.id); setInput(''); setOutput(''); setError(''); setErrorLine(null) }}
                                className={`flex-1 min-w-0 text-left pl-2.5 pr-1 py-2 text-[13px] truncate ${
                                  isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                                }`}
                                title={t.name}
                              >
                                {t.name}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(t.id) }}
                                aria-label={isFav ? 'Unpin from favorites' : 'Pin to favorites'}
                                title={isFav ? 'Unpin from favorites' : 'Pin to favorites'}
                                className={`px-2 py-2 rounded-md transition flex-shrink-0 ${
                                  isFav
                                    ? 'text-amber-400'
                                    : isActive
                                    ? 'text-white/60 hover:text-amber-300'
                                    : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                                }`}
                              >
                                <Star className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>

            <div className="mt-4">
              <AdSlot slot="sidebar" format="rectangle" style={{ display: 'block', minHeight: 250 }} />
            </div>
          </aside>
          )}

          {/* Main workspace */}
          <main className="space-y-4 min-w-0">
            {showShared && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 px-4 py-3 text-sm">
                Opened a shared snippet — tool and input were loaded from the link.
              </div>
            )}

            {activeTool?.id === 'diff-check' ? (
              <DiffChecker />
            ) : activeTool?.id === 'json-tree' ? (
              <JsonTree />
            ) : activeTool?.id === 'cron-tool' ? (
              <CronTool />
            ) : (
              <>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{activeTool?.category}</div>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">{activeTool?.name}</h2>
                      <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">{activeTool?.desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => toggleFavorite(activeTool.id)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        favorites.includes(activeTool.id)
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}>
                        <Star className="w-4 h-4" fill={favorites.includes(activeTool.id) ? 'currentColor' : 'none'} /> {favorites.includes(activeTool.id) ? 'Pinned' : 'Pin'}
                      </button>
                      <button onClick={handleLoadSample} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                        <Sparkles className="w-4 h-4" /> Sample
                      </button>
                      <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                        <Upload className="w-4 h-4" /> Upload File
                      </button>
                      <input ref={fileRef} type="file" accept=".json,.xml,.yaml,.yml,.csv,.html,.css,.js,.sql,.txt,text/*,application/json,application/xml" onChange={handleFileUpload} className="hidden" />
                      <button onClick={handleShare} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                        <Share2 className="w-4 h-4" /> {copyShare.copied ? 'Link copied!' : 'Share'}
                      </button>
                      <button onClick={handleRun} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow shadow-blue-600/30 hover:shadow-lg transition">
                        <Play className="w-4 h-4" /> {running ? 'Running...' : 'Run'}
                      </button>
                    </div>
                  </div>

                  {/* Per-tool options: CSV delimiter chooser */}
                  {activeTool?.id === 'csv-to-json' && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Delimiter</span>
                      <div className="inline-flex rounded-lg bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                        {[
                          { v: ',', label: 'Comma (,)' },
                          { v: ';', label: 'Semicolon (;)' },
                          { v: '\t', label: 'Tab (\\t)' },
                        ].map((o) => (
                          <button
                            key={o.v}
                            onClick={() => setCsvDelimiter(o.v)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${csvDelimiter === o.v ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Tip: wrap values that contain the delimiter in double quotes, e.g. <code className="mono">&quot;Martin, Lang and Andrade&quot;</code>.
                      </span>
                    </div>
                  )}

                  {/* Per-tool options: blank-line spacing for XML multi-message streams */}
                  {XML_BLOCK_TOOLS.includes(activeTool?.id) && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                        <AlignJustify className="w-4 h-4" /> Blank Line Spacing
                      </span>
                      <button
                        role="switch"
                        aria-checked={blankLines}
                        onClick={() => setBlankLines((v) => !v)}
                        data-testid="blank-lines-toggle"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${blankLines ? 'bg-gradient-to-r from-blue-600 to-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${blankLines ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Adds an empty line between formatted blocks so multi-message streams (separated by <code className="mono">]]&gt;</code> or <code className="mono">]]&gt;]]&gt;</code>) are easier to scan.
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Input panel */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">Input</div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                          <Upload className="w-4 h-4" /> Upload
                        </button>
                        <button onClick={() => copyIn.copy(input)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                          {copyIn.copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          {copyIn.copied ? 'Copied' : 'Copy'}
                        </button>
                        <button onClick={clearInput} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                          <Eraser className="w-4 h-4" /> Clear
                        </button>
                      </div>
                    </div>
                    <NumberedTextarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Paste your ${activeTool?.name.split(' ')[0] || 'text'} here, or upload a file...`}
                      errorLine={errorLine}
                    />
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => copyIn.copy(input)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                          {copyIn.copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          {copyIn.copied ? 'Copied' : 'Copy'}
                        </button>
                        <button onClick={clearInput} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                          <Eraser className="w-4 h-4" /> Clear
                        </button>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {input.length.toLocaleString()} chars · {input ? input.split('\n').length.toLocaleString() : 0} lines
                      </span>
                    </div>
                  </div>

                  {/* Output panel */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Output
                        {activeTool?.outLang && activeTool.outLang !== 'plaintext' && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">{activeTool.outLang}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={handleDownload} disabled={!output} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-sm transition">
                          <Download className="w-4 h-4" /> Download
                        </button>
                        <button onClick={() => copyOutTop.copy(output)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                          {copyOutTop.copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          {copyOutTop.copied ? 'Copied' : 'Copy'}
                        </button>
                        <button onClick={clearOutput} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                          <Eraser className="w-4 h-4" /> Clear
                        </button>
                      </div>
                    </div>
                    <div className="relative flex flex-col flex-1 min-h-[380px] overflow-hidden">
                      {error ? (
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 flex-1">
                          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 px-4 py-3">
                            <div className="font-semibold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> Error{errorLine ? ` on line ${errorLine}` : ''}
                            </div>
                            <div className="text-sm mt-1 mono whitespace-pre-wrap break-words">{error}</div>
                            <div className="text-xs mt-2 text-rose-600/80 dark:text-rose-400/80">
                              Your input is preserved on the left — fix the highlighted line and the result updates automatically.
                            </div>
                          </div>
                        </div>
                      ) : output ? (
                        <NumberedOutput text={output} html={outputHtml} />
                      ) : (
                        <div className="mono p-4 text-[15px] text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 flex-1">Your result will appear here...</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => copyOutBot.copy(output)} disabled={!output} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 text-sm font-medium transition">
                          {copyOutBot.copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copyOutBot.copied ? 'Copied!' : 'Copy Output'}
                        </button>
                        <button onClick={handleDownload} disabled={!output} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                          <Download className="w-4 h-4" /> Download
                        </button>
                        <button onClick={clearOutput} disabled={!output && !error} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                          <Eraser className="w-4 h-4" /> Clear Output
                        </button>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {output.length.toLocaleString()} chars · {output ? output.split('\n').length.toLocaleString() : 0} lines
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Recent History */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <History className="w-4 h-4" /> Recent activity
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({history.length} saved locally)</span>
                  </div>
                  <button onClick={clearHistory} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                    <Trash2 className="w-4 h-4" /> Clear all
                  </button>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((h) => {
                    const tool = ALL_TOOLS.find((t) => t.id === h.toolId)
                    return (
                      <li key={h.id}>
                        <button onClick={() => loadFromHistory(h)} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 mt-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium text-slate-800 dark:text-slate-100 truncate">{tool?.name || h.toolId}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">{new Date(h.ts).toLocaleString()}</div>
                            </div>
                            <div className="mono text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {h.input.slice(0, 140).replace(/\n/g, ' ')}{h.input.length > 140 ? '…' : ''}
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </main>
        </div>

        <AdSlot slot="inContent" className="mt-8" />
      </section>

      <BlogTeaser />
      <SeoContent />

      <section id="about" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Everything a developer needs, in one place</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Code Formatter Pro bundles the most-loved developer utilities into one clean workspace. Switch between formatters, minifiers and converters with a single click — no ads, no sign-up, no data uploads. Perfect for debugging APIs, cleaning up config files or preparing production-ready assets.
            </p>
            <ul className="mt-5 space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Instant, keystroke-level formatting with syntax highlighting</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Upload files or paste text — download results in one click</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Copy & clear controls at the top and bottom of every panel</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Popular converters like XML ↔ JSON, YAML ↔ JSON, CSV ↔ JSON</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Encoders for Base64, URL, HTML entities and JWT tokens</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Beautiful light & dark themes with instant switching</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-1 shadow-2xl shadow-blue-600/30">
            <div className="rounded-3xl bg-slate-900 text-slate-100 p-6 mono text-sm">
              <div className="flex gap-1.5 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
              </div>
              <pre className="whitespace-pre-wrap">
<span className="text-slate-400">{`// XML to JSON — one click.`}</span>{'\n'}
<span className="text-fuchsia-300">{`<user>`}</span>{'\n'}
{`  `}<span className="text-fuchsia-300">{`<name>`}</span><span className="text-emerald-300">Ada</span><span className="text-fuchsia-300">{`</name>`}</span>{'\n'}
{`  `}<span className="text-fuchsia-300">{`<age>`}</span><span className="text-amber-300">36</span><span className="text-fuchsia-300">{`</age>`}</span>{'\n'}
<span className="text-fuchsia-300">{`</user>`}</span>{'\n\n'}
<span className="text-emerald-300">{`// becomes`}</span>{'\n'}
{`{
  "user": {
    "name": "Ada",
    "age": 36
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-300">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <AdSlot slot="footer" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-lg font-bold text-white">Code Formatter Pro</div>
            </div>
            <p className="mt-3 text-slate-400">
              A free suite of developer utilities to format, convert and clean your code — right in the browser.
            </p>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Categories</div>
            <ul className="space-y-2 text-slate-400">
              {CATEGORIES.map((c) => (
                <li key={c}><a href="#tools" className="hover:text-white transition">{c}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Explore</div>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/blog" className="hover:text-white transition inline-flex items-center gap-1"><BookOpen className="w-4 h-4" /> Blog</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Built by NeoWebSolutions</div>
            <p className="text-slate-400">
              This project is designed and maintained by NeoWebSolutions — a studio building fast, delightful web experiences.
            </p>
            <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:opacity-90 transition">
              Visit NeoWebSolutions <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-5 text-sm text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} Code Formatter Pro. All rights reserved.</span>
            <span>
              Built with care by{' '}
              <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-amber-300 underline underline-offset-2">
                NeoWebSolutions
              </a>
            </span>
          </div>
        </div>
      </footer>

      <CookieConsent />
    </div>
  )
}

export default App
