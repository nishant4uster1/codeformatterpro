'use client'

import { useDeferredValue, useState, useMemo, useCallback, useRef } from 'react'
import { ChevronRight, ChevronDown, Braces, Sparkles, Eraser, Expand, Minimize2, Upload } from 'lucide-react'

// Beyond this many children we chunk-render an object/array with
// content-visibility so the browser only paints what's on-screen.
const CHILDREN_CHUNK = 200
// Approx row height in px — used for containIntrinsicSize so the browser
// can reserve scroll space without measuring each row.
const ROW_PX = 22

const typeOf = (v) => {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}

// Iterative BFS collect: recursion could blow the stack on very deep JSON.
const collectPaths = (value) => {
  const out = []
  const stack = [{ v: value, p: '$' }]
  while (stack.length) {
    const { v, p } = stack.pop()
    const t = typeOf(v)
    if (t !== 'object' && t !== 'array') continue
    out.push(p)
    const keys = t === 'array' ? v.map((_, i) => i) : Object.keys(v)
    for (const k of keys) stack.push({ v: v[k], p: `${p}.${k}` })
  }
  return out
}

const readTextFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result || ''))
  reader.onerror = () => reject(reader.error)
  reader.readAsText(file)
})

const Leaf = ({ k, value, depth }) => {
  const t = typeOf(value)
  const colorMap = {
    string: 'text-emerald-600 dark:text-emerald-300',
    number: 'text-amber-600 dark:text-amber-300',
    boolean: 'text-blue-600 dark:text-blue-300',
    null: 'text-slate-500 dark:text-slate-400',
  }
  const label = k === undefined ? '' : <span className="text-fuchsia-600 dark:text-fuchsia-300">{JSON.stringify(k)}</span>
  return (
    <div className="flex items-start gap-2" style={{ paddingLeft: depth * 16 }}>
      <span className="w-4" />
      {k !== undefined && <>{label}<span className="text-slate-400">:</span></>}
      <span className={colorMap[t] || ''}>{t === 'string' ? `"${value}"` : String(value)}</span>
    </div>
  )
}

const Node = ({ k, value, depth, open, toggle, path }) => {
  const t = typeOf(value)
  const collapsible = t === 'object' || t === 'array'
  // Default state: opened at depth <= 1, collapsed deeper (so huge trees don't explode on paste).
  const defaultOpen = depth <= 1
  const isOpen = open[path] === undefined ? defaultOpen : open[path]
  const label = k === undefined ? '' : <span className="text-fuchsia-600 dark:text-fuchsia-300">{JSON.stringify(k)}</span>

  if (!collapsible) return <Leaf k={k} value={value} depth={depth} />

  const keys = t === 'array' ? value.map((_, i) => i) : Object.keys(value)
  const open_c = t === 'array' ? '[' : '{'
  const close_c = t === 'array' ? ']' : '}'
  const large = keys.length > CHILDREN_CHUNK

  return (
    <div>
      <div className="flex items-start gap-2 select-none" style={{ paddingLeft: depth * 16 }}>
        <button
          onClick={() => toggle(path)}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {k !== undefined && <>{label}<span className="text-slate-400">:</span></>}
        <span className="text-slate-500 dark:text-slate-400">{open_c}</span>
        {!isOpen && <span className="text-slate-400 italic text-xs">{keys.length.toLocaleString()} {t === 'array' ? 'items' : 'keys'}</span>}
        {!isOpen && <span className="text-slate-500 dark:text-slate-400">{close_c}</span>}
      </div>
      {isOpen && (
        <>
          {!large && keys.map((ck) => (
            <Node
              key={ck}
              k={ck}
              value={value[ck]}
              depth={depth + 1}
              open={open}
              toggle={toggle}
              path={`${path}.${ck}`}
            />
          ))}
          {large && (() => {
            const chunks = []
            for (let i = 0; i < keys.length; i += CHILDREN_CHUNK) {
              chunks.push(keys.slice(i, i + CHILDREN_CHUNK))
            }
            return chunks.map((chunk, ci) => (
              <div
                key={ci}
                style={{ contentVisibility: 'auto', containIntrinsicSize: `${chunk.length * ROW_PX}px` }}
              >
                {chunk.map((ck) => (
                  <Node
                    key={ck}
                    k={ck}
                    value={value[ck]}
                    depth={depth + 1}
                    open={open}
                    toggle={toggle}
                    path={`${path}.${ck}`}
                  />
                ))}
              </div>
            ))
          })()}
          <div style={{ paddingLeft: depth * 16 }} className="pl-2 text-slate-500 dark:text-slate-400">{close_c}</div>
        </>
      )}
    </div>
  )
}

const JsonTree = () => {
  const [text, setText] = useState('')
  const [open, setOpen] = useState({})
  const fileRef = useRef(null)

  const toggle = useCallback((p) => {
    setOpen((o) => {
      const depth = (p.match(/\./g) || []).length
      const currentDefault = depth <= 1
      const current = o[p] === undefined ? currentDefault : o[p]
      return { ...o, [p]: !current }
    })
  }, [])

  // Defer parsing so typing/pasting stays responsive on huge JSON.
  const dText = useDeferredValue(text)
  const parsing = dText !== text

  const parsed = useMemo(() => {
    if (!dText.trim()) return { ok: true, data: null }
    try { return { ok: true, data: JSON.parse(dText) } }
    catch (e) { return { ok: false, err: e.message } }
  }, [dText])

  const expandAll = () => {
    if (!parsed.ok || parsed.data === null) return
    const paths = collectPaths(parsed.data)
    // Guard: expanding truly huge trees would create a giant DOM.
    if (paths.length > 20_000) {
      const proceed = typeof window !== 'undefined' && window.confirm(
        `This will expand ${paths.length.toLocaleString()} nodes and may slow the browser. Continue?`,
      )
      if (!proceed) return
    }
    const next = {}
    for (const p of paths) next[p] = true
    setOpen(next)
  }
  const collapseAll = () => {
    if (!parsed.ok || parsed.data === null) return
    const paths = collectPaths(parsed.data)
    const next = {}
    for (const p of paths) next[p] = p === '$'
    setOpen(next)
  }

  const loadSample = () => setText(JSON.stringify({
    name: 'Ada Lovelace', age: 36, active: true, tags: ['math', 'logic', 'engines'],
    address: { city: 'London', country: 'UK', geo: { lat: 51.5, lng: -0.12 } },
    projects: [{ id: 1, title: 'Analytical Engine', open: true }, { id: 2, title: 'Notes G', open: false }],
    manager: null,
  }, null, 2))

  const onPickFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const t = await readTextFile(file)
      setText(t)
      setOpen({})
    } catch (e) {
      console.error('File read failed', e)
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-4" data-testid="json-tree">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Viewers</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">JSON Tree Viewer</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Explore any JSON as a collapsible tree — perfect for large API responses. Handles multi-megabyte files.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={expandAll} disabled={!parsed.ok || parsed.data === null} data-testid="json-expand-all" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Expand className="w-4 h-4" /> Expand all
            </button>
            <button onClick={collapseAll} disabled={!parsed.ok || parsed.data === null} data-testid="json-collapse-all" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Minimize2 className="w-4 h-4" /> Collapse all
            </button>
            <button onClick={loadSample} data-testid="json-sample" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Sparkles className="w-4 h-4" /> Sample
            </button>
            <button onClick={() => fileRef.current?.click()} data-testid="json-upload-btn" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Upload className="w-4 h-4" /> Upload
            </button>
            <input ref={fileRef} type="file" accept=".json,.txt,application/json,text/*" className="hidden" onChange={onPickFile} data-testid="json-upload-input" />
            <button onClick={() => { setText(''); setOpen({}) }} data-testid="json-clear" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Eraser className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span>JSON input</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{text.length.toLocaleString()} chars</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste JSON here or click Upload..."
            spellCheck={false}
            data-testid="json-input"
            className="mono w-full flex-1 min-h-[380px] p-4 text-[15px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none resize-y"
          />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2"><Braces className="w-4 h-4" /> Tree view</span>
            {parsing && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-0.5 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Parsing…
              </span>
            )}
          </div>
          <div className="p-4 mono text-[15px] leading-relaxed bg-slate-50 dark:bg-slate-950 rounded-b-2xl overflow-auto min-h-[380px] max-h-[70vh]" data-testid="json-output">
            {!text.trim() && <div className="text-slate-400 dark:text-slate-600">The parsed JSON tree will appear here.</div>}
            {text.trim() && !parsed.ok && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 px-4 py-3">
                <div className="font-semibold">Invalid JSON</div>
                <div className="text-sm mt-1">{parsed.err}</div>
              </div>
            )}
            {text.trim() && parsed.ok && (
              <Node value={parsed.data} depth={0} open={open} toggle={toggle} path="$" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JsonTree
