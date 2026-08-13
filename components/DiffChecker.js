'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { diffLines, diffWordsWithSpace } from 'diff'
import { Sparkles, ArrowLeftRight, Eraser, Upload, Download, FileText, FileSpreadsheet } from 'lucide-react'

// Hard cap per uploaded file so we don't OOM the tab.
const MAX_FILE_BYTES = 30 * 1024 * 1024 // 30 MB
// Beyond this many chars per side we drop from word-diff to line-diff
// because diffWordsWithSpace is O(n*m) and freezes the browser on big files.
const WORD_DIFF_LIMIT = 200_000
// Above this many diff rows we render only the first N in the DOM and
// point users at the CSV/TXT download for the full picture. Keeping the
// visible DOM bounded stops React reconciliation from grinding to a halt
// on very large diffs.
const MAX_RENDERED_ROWS = 50_000
// Row chunk size for content-visibility windowing. Rows inside an off-screen
// chunk are not laid out or painted until the user scrolls near them.
const ROW_CHUNK = 200
// Estimated pixel height of one diff row — used for contain-intrinsic-size
// so the browser can reserve space without measuring each row.
const ROW_PX = 22

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

// Visualise trailing spaces / tabs so the user can *see* them
const visibleWs = (text) =>
  text
    .replace(/\t/g, '\u2192   ') // → arrow for tab
    .replace(/ (?=\n|$)/g, '\u00b7') // middle-dot for trailing space

// Split a diff-part's value into individual lines (keep them separated so we
// can render one row per line with its A/B line number and its own colour).
const splitLines = (value) => {
  if (value === '') return []
  const parts = value.split('\n')
  if (parts.length && parts[parts.length - 1] === '') parts.pop()
  return parts
}

const readTextFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result || ''))
  reader.onerror = () => reject(reader.error)
  reader.readAsText(file)
})

// CSV field escaping: wrap in quotes, double any inner quotes.
const csvEscape = (v) => {
  const s = v == null ? '' : String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

// Trigger a browser download from an array of string chunks. Blob accepts
// the array directly which avoids one giant string concatenation.
const downloadChunks = (chunks, filename, mime) => {
  const blob = new Blob(chunks, { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 500)
}

const DiffChecker = () => {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [mode, setMode] = useState('line') // 'line' | 'word'
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [ignoreLeadTrail, setIgnoreLeadTrail] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const leftFileRef = useRef(null)
  const rightFileRef = useRef(null)

  // Worker + job tracking. The worker owns all diff computation so the main
  // thread stays free even for 30 MB × 30 MB inputs. If the worker fails to
  // spawn (rare — very old browsers or a bundler quirk) we fall back to
  // synchronous on-thread computation so the tool still works.
  const workerRef = useRef(null)
  const jobIdRef = useRef(0)
  const [rawParts, setRawParts] = useState(null)       // parts returned by worker
  const [rawMode, setRawMode] = useState('line')       // mode the worker actually ran
  const [downgraded, setDowngraded] = useState(false)  // word→line auto fallback
  const [workerBusy, setWorkerBusy] = useState(false)
  const [workerReady, setWorkerReady] = useState(false)

  // Spin up the worker once. Cleanup terminates it so nothing lingers.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') return
    let w
    try {
      w = new Worker(new URL('./diff.worker.js', import.meta.url))
      workerRef.current = w
      setWorkerReady(true)
    } catch (e) {
      // Worker unavailable — the sync fallback below will still work.
      console.warn('Diff worker init failed, using main thread', e)
      return
    }
    w.onmessage = (event) => {
      const { id, ok, parts, mode: retMode } = event.data || {}
      if (id !== jobIdRef.current) return // stale reply for a superseded input
      setWorkerBusy(false)
      if (ok) {
        setRawParts(parts)
        setRawMode(retMode)
      }
    }
    return () => { try { w.terminate() } catch {} ; workerRef.current = null; setWorkerReady(false) }
  }, [])

  // Defer heavy diff work so typing / pasting stays responsive on big files.
  const dLeft = useDeferredValue(left)
  const dRight = useDeferredValue(right)

  // Dispatch a fresh diff job whenever the deferred inputs / options change.
  // Every message carries a monotonically-increasing id so late replies for
  // superseded inputs are discarded in the onmessage handler above.
  useEffect(() => {
    if (!dLeft && !dRight) {
      setRawParts([]); setDowngraded(false); setWorkerBusy(false); jobIdRef.current++
      return
    }
    if (dLeft === dRight) {
      setRawParts([]); setRawMode(mode); setDowngraded(false); setWorkerBusy(false); jobIdRef.current++
      return
    }
    // Word-diff is O(n*m) and truly wedges the tab on big inputs — even in a
    // worker the compute would take forever. Auto-fall back to line-diff.
    const bigForWord = dLeft.length > WORD_DIFF_LIMIT || dRight.length > WORD_DIFF_LIMIT
    const effectiveMode = mode === 'word' && bigForWord ? 'line' : mode
    setDowngraded(mode === 'word' && bigForWord)

    const id = ++jobIdRef.current
    const w = workerRef.current
    if (w) {
      setWorkerBusy(true)
      w.postMessage({
        id,
        mode: effectiveMode,
        left: dLeft,
        right: dRight,
        ignoreCase,
        ignoreLeadTrail,
      })
    } else {
      // Synchronous fallback — only reached when Worker can't be spawned.
      let l = dLeft; let r = dRight
      if (ignoreLeadTrail) {
        l = l.split('\n').map((s) => s.trim()).join('\n')
        r = r.split('\n').map((s) => s.trim()).join('\n')
      }
      if (ignoreCase) { l = l.toLowerCase(); r = r.toLowerCase() }
      const parts = effectiveMode === 'word'
        ? diffWordsWithSpace(l, r)
        : diffLines(l, r, { newlineIsToken: false })
      setRawParts(parts); setRawMode(effectiveMode); setWorkerBusy(false)
    }
  }, [dLeft, dRight, mode, ignoreCase, ignoreLeadTrail])

  const computing = workerBusy || dLeft !== left || dRight !== right

  // Derive stats from the parts the worker returned. No heavy diff work here —
  // just an O(n) walk to build rows / line-number tracking / summaries. This
  // stays fast even for large diffs and is safe on the main thread.
  const stats = useMemo(() => {
    if (!rawParts) {
      return { parts: [], rows: [], added: 0, removed: 0, mode: rawMode, downgraded, changedA: '', changedB: '' }
    }

    if (rawMode === 'word') {
      // Word mode: tag each part with the starting line in A and B so the
      // on-screen badges and the CSV/TXT exports can point at the right line.
      let aLine = 1
      let bLine = 1
      const parts = rawParts.map((p) => {
        const lineA = aLine
        const lineB = bLine
        const nl = (p.value.match(/\n/g) || []).length
        if (p.added) bLine += nl
        else if (p.removed) aLine += nl
        else { aLine += nl; bLine += nl }
        return { ...p, lineA, lineB }
      })
      let added = 0, removed = 0
      parts.forEach((p) => { if (p.added) added += p.value.length; if (p.removed) removed += p.value.length })
      return { parts, added, removed, mode: 'word', downgraded }
    }

    // Line mode: expand parts into per-line rows with A / B line numbers.
    const rows = []
    const changedA = []
    const changedB = []
    let aLine = 1
    let bLine = 1
    for (const p of rawParts) {
      const lines = splitLines(p.value)
      for (const line of lines) {
        if (p.added) {
          rows.push({ kind: 'add', a: null, b: bLine, text: line })
          changedB.push(bLine)
          bLine++
        } else if (p.removed) {
          rows.push({ kind: 'del', a: aLine, b: null, text: line })
          changedA.push(aLine)
          aLine++
        } else {
          rows.push({ kind: 'eq', a: aLine, b: bLine, text: line })
          aLine++
          bLine++
        }
      }
    }

    const summarise = (nums) => {
      if (!nums.length) return ''
      const uniq = [...new Set(nums)].sort((a, b) => a - b)
      const ranges = []
      let start = uniq[0], prev = uniq[0]
      for (let i = 1; i < uniq.length; i++) {
        if (uniq[i] === prev + 1) prev = uniq[i]
        else { ranges.push(start === prev ? `${start}` : `${start}\u2013${prev}`); start = prev = uniq[i] }
      }
      ranges.push(start === prev ? `${start}` : `${start}\u2013${prev}`)
      const s = ranges.join(', ')
      return s.length > 400 ? `${s.slice(0, 400)}\u2026 (+${ranges.length} more)` : s
    }

    let added = 0, removed = 0
    rawParts.forEach((p) => {
      const lines = p.count || (p.value.match(/\n/g) || []).length
      if (p.added) added += lines
      if (p.removed) removed += lines
    })
    return {
      parts: rawParts, rows, added, removed, mode: 'line',
      changedA: summarise(changedA),
      changedB: summarise(changedB),
      downgraded,
    }
  }, [rawParts, rawMode, downgraded])

  const equal = dLeft === dRight
  const loadSample = () => {
    setLeft(`function greet(name) {\n  return "Hello, " + name + "!"; \n}\nconst user = "Ada";\nconsole.log(greet(user));`)
    setRight(`function greet(name){\n  return \`Hello, \${name}!\`;\n}\nconst user = "Grace";\nconsole.log(greet(user));\n`)
  }
  const clearAll = () => { setLeft(''); setRight('') }
  const swap = () => { const a = left; setLeft(right); setRight(a) }

  const onPickFile = (setter) => async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadError('')
    if (file.size > MAX_FILE_BYTES) {
      setUploadError(`${file.name} is ${fmtBytes(file.size)} — the diff tool supports up to ${fmtBytes(MAX_FILE_BYTES)} per side.`)
      event.target.value = ''
      return
    }
    try {
      const text = await readTextFile(file)
      setter(text)
    } catch (e) {
      setUploadError(`Could not read ${file.name}: ${e?.message || e}`)
    } finally {
      event.target.value = ''
    }
  }

  // Build a plain-text diff of ALL rows/parts (not just the rendered
  // slice) so the download always reflects the full comparison.
  const downloadTxt = () => {
    let chunks
    if (stats.mode === 'word' && stats.parts) {
      // wdiff / git-style inline markers: {+added+} and [-removed-]
      // Each change fragment is prefixed with its starting line in each file.
      chunks = ['# Word diff — Original (A) vs Changed (B)\n']
      chunks.push('# {+added+}  [-removed-]  (unchanged text is bare)\n')
      chunks.push('# @A:n / @B:n = starting line in Original / Changed\n\n')
      for (const p of stats.parts) {
        if (p.added) chunks.push(`{+@B:${p.lineB} ${p.value}+}`)
        else if (p.removed) chunks.push(`[-@A:${p.lineA} ${p.value}-]`)
        else chunks.push(p.value)
      }
      chunks.push('\n')
    } else if (stats.mode === 'line' && stats.rows) {
      chunks = ['--- Original (A)\n+++ Changed (B)\n']
      const pad = (n, w) => (n == null ? '' : String(n)).padStart(w, ' ')
      for (const row of stats.rows) {
        const marker = row.kind === 'add' ? '+' : row.kind === 'del' ? '-' : ' '
        chunks.push(`${pad(row.a, 7)} ${pad(row.b, 7)} ${marker} ${row.text}\n`)
      }
    } else {
      return
    }
    downloadChunks(chunks, `diff-${stats.mode}-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`, 'text/plain;charset=utf-8')
  }

  const downloadCsv = () => {
    let chunks
    if (stats.mode === 'word' && stats.parts) {
      // One row per diff-part. `text` may contain newlines/quotes — CSV-escape
      // handles both. Empty parts are skipped so the file stays tidy.
      // line_a / line_b record the starting line of each fragment in each
      // file so you can jump straight to the mistake in the original.
      chunks = ['index,change,line_a,line_b,length,text\n']
      let idx = 0
      for (const p of stats.parts) {
        if (!p.value) continue
        const change = p.added ? 'added' : p.removed ? 'removed' : 'unchanged'
        // For 'added' rows the A line is not applicable and vice-versa.
        const la = p.added ? '' : p.lineA
        const lb = p.removed ? '' : p.lineB
        chunks.push(`${idx},${change},${csvEscape(la)},${csvEscape(lb)},${p.value.length},${csvEscape(p.value)}\n`)
        idx++
      }
    } else if (stats.mode === 'line' && stats.rows) {
      chunks = ['line_a,line_b,change,text\n']
      for (const row of stats.rows) {
        const kind = row.kind === 'add' ? 'added' : row.kind === 'del' ? 'removed' : 'unchanged'
        chunks.push(`${csvEscape(row.a)},${csvEscape(row.b)},${kind},${csvEscape(row.text)}\n`)
      }
    } else {
      return
    }
    downloadChunks(chunks, `diff-${stats.mode}-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`, 'text/csv;charset=utf-8')
  }

  // The downloads are available whenever there is something to compare and
  // the two sides are not identical — works for both line and word modes.
  const canDownload = !equal && (
    (stats.mode === 'line' && stats.rows?.length > 0) ||
    (stats.mode === 'word' && stats.parts?.length > 0)
  )

  // Chunk the rows for rendering, capped at MAX_RENDERED_ROWS so the DOM
  // stays bounded even for a 30 MB × 30 MB diff. The download buttons still
  // export EVERY row.
  const rendered = useMemo(() => {
    if (stats.mode !== 'line' || !stats.rows) return { rows: [], truncated: false, total: 0 }
    const total = stats.rows.length
    const truncated = total > MAX_RENDERED_ROWS
    const rows = truncated ? stats.rows.slice(0, MAX_RENDERED_ROWS) : stats.rows
    return { rows, truncated, total }
  }, [stats])

  const rowChunks = useMemo(() => {
    if (!rendered.rows.length) return []
    const chunks = []
    for (let i = 0; i < rendered.rows.length; i += ROW_CHUNK) {
      chunks.push(rendered.rows.slice(i, i + ROW_CHUNK))
    }
    return chunks
  }, [rendered])

  return (
    <div className="space-y-4" data-testid="diff-checker">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Utilities</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">Diff Checker</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Compare two blocks of text and highlight every difference — including trailing spaces, tabs and blank lines. Supports files up to {fmtBytes(MAX_FILE_BYTES)} per side and downloads the full diff as CSV or TXT.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadTxt} disabled={!canDownload} data-testid="diff-download-txt" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <FileText className="w-4 h-4" /> Download TXT
            </button>
            <button onClick={downloadCsv} disabled={!canDownload} data-testid="diff-download-csv" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <FileSpreadsheet className="w-4 h-4" /> Download CSV
            </button>
            <button onClick={loadSample} data-testid="diff-sample" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Sparkles className="w-4 h-4" /> Sample
            </button>
            <button onClick={swap} data-testid="diff-swap" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <ArrowLeftRight className="w-4 h-4" /> Swap
            </button>
            <button onClick={clearAll} data-testid="diff-clear" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Eraser className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>

        {uploadError && (
          <div data-testid="diff-upload-error" className="mt-3 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-xs text-rose-800 dark:text-rose-200">
            {uploadError}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            {['line', 'word'].map((m) => (
              <button key={m} onClick={() => setMode(m)} data-testid={`diff-mode-${m}`} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${mode === m ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {m === 'line' ? 'Line diff' : 'Word diff'}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input type="checkbox" data-testid="diff-ignore-case" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="rounded" />
            Ignore case
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input type="checkbox" data-testid="diff-ignore-space" checked={ignoreLeadTrail} onChange={(e) => setIgnoreLeadTrail(e.target.checked)} className="rounded" />
            Ignore leading/trailing spaces
          </label>
          {computing && (
            <span data-testid="diff-computing" className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2.5 py-1 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Computing…
            </span>
          )}
          <div className="ml-auto text-sm">
            {equal ? (
              <span data-testid="diff-equal" className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Texts are identical</span>
            ) : (
              <span className="text-slate-600 dark:text-slate-300">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{stats.added}</span>{' '}
                <span className="text-rose-600 dark:text-rose-400 font-semibold">-{stats.removed}</span>{' '}
                {stats.mode === 'line' ? 'lines' : 'chars'}
              </span>
            )}
          </div>
        </div>

        {stats.downgraded && (
          <div data-testid="diff-downgraded" className="mt-3 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
            Word-level diff is disabled for very large inputs to keep the browser responsive — showing line-level diff instead.
          </div>
        )}

        {stats.mode === 'line' && !equal && (stats.changedA || stats.changedB) && (
          <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-100">Lines that differ</div>
            <div className="mt-1 grid sm:grid-cols-2 gap-x-6 gap-y-1">
              <div>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Original (A):</span>{' '}
                <span className="mono">{stats.changedA || '\u2014'}</span>
              </div>
              <div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Changed (B):</span>{' '}
                <span className="mono">{stats.changedB || '\u2014'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: 'Original (A)', val: left, set: setLeft, ph: 'Paste the original text or upload a file...', fileRef: leftFileRef, testId: 'diff-left' },
          { label: 'Changed (B)', val: right, set: setRight, ph: 'Paste the modified text or upload a file...', fileRef: rightFileRef, testId: 'diff-right' },
        ].map((x) => (
          <div key={x.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="font-semibold text-slate-800 dark:text-slate-100">{x.label}</div>
              <button
                type="button"
                onClick={() => x.fileRef.current?.click()}
                data-testid={`${x.testId}-upload-btn`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
              >
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
              <input
                ref={x.fileRef}
                type="file"
                accept=".txt,.log,.csv,.json,.xml,.yaml,.yml,.md,.js,.jsx,.ts,.tsx,.css,.html,.py,.java,.go,.rb,.rs,.c,.h,.cpp,.hpp,.sql,.sh,.env,text/*"
                className="hidden"
                data-testid={`${x.testId}-upload-input`}
                onChange={onPickFile(x.set)}
              />
            </div>
            <textarea
              value={x.val}
              onChange={(e) => x.set(e.target.value)}
              placeholder={x.ph}
              spellCheck={false}
              data-testid={`${x.testId}-textarea`}
              className="mono w-full flex-1 min-h-[220px] p-4 text-[15px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none resize-y"
            />
            <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
              {x.val.length.toLocaleString()} chars · {x.val ? x.val.split('\n').length.toLocaleString() : 0} lines
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            Differences
            {stats.mode === 'line' && stats.rows && (
              <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                {rendered.truncated
                  ? `showing ${rendered.rows.length.toLocaleString()} of ${rendered.total.toLocaleString()} rows`
                  : `${rendered.total.toLocaleString()} rows`}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500 mr-1"></span> added ·{' '}
            <span className="inline-block w-2 h-2 rounded-sm bg-rose-500 mx-1"></span> removed ·{' '}
            <span className="text-slate-500 dark:text-slate-400">·</span> trailing space · <span className="text-slate-500">→</span> tab
          </div>
        </div>
        {rendered.truncated && (
          <div data-testid="diff-truncated-notice" className="px-4 py-2 border-b border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200 flex flex-wrap items-center gap-2">
            <span>
              Diff is huge — displaying the first {MAX_RENDERED_ROWS.toLocaleString()} of {rendered.total.toLocaleString()} rows to keep the browser snappy.
            </span>
            <button onClick={downloadCsv} className="inline-flex items-center gap-1 underline font-medium">
              <Download className="w-3 h-3" /> Download full diff
            </button>
          </div>
        )}
        <div className="mono text-[14px] leading-relaxed bg-slate-50 dark:bg-slate-950 rounded-b-2xl overflow-auto max-h-[520px] min-h-[220px]" data-testid="diff-output">
          {!left && !right && <div className="p-4 text-slate-400 dark:text-slate-600">Paste text or upload a file into both boxes to see the differences here.</div>}
          {(left || right) && equal && <div className="p-4 text-emerald-600 dark:text-emerald-400">The two texts are identical.</div>}
          {(left || right) && !equal && stats.mode === 'line' && (
            <div className="divide-y divide-slate-100 dark:divide-slate-900">
              {rowChunks.map((chunk, ci) => (
                <div
                  key={ci}
                  style={{ contentVisibility: 'auto', containIntrinsicSize: `${chunk.length * ROW_PX}px` }}
                >
                  {chunk.map((row, i) => {
                    const kindCls = row.kind === 'add'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : row.kind === 'del'
                      ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                      : 'text-slate-700 dark:text-slate-300'
                    const marker = row.kind === 'add' ? '+' : row.kind === 'del' ? '-' : ' '
                    const markerCls = row.kind === 'add'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : row.kind === 'del'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400'
                    return (
                      <div key={i} className={`flex ${kindCls}`}>
                        <div className="select-none w-14 flex-shrink-0 text-right px-2 py-1 text-xs text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-900">
                          {row.a ?? ''}
                        </div>
                        <div className="select-none w-14 flex-shrink-0 text-right px-2 py-1 text-xs text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-900">
                          {row.b ?? ''}
                        </div>
                        <div className={`select-none w-6 flex-shrink-0 text-center py-1 font-bold ${markerCls}`}>{marker}</div>
                        <pre className="whitespace-pre-wrap break-words py-1 pr-3 flex-1">{visibleWs(row.text) || '\u00a0'}</pre>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
          {(left || right) && !equal && stats.mode === 'word' && (
            <pre className="whitespace-pre-wrap break-words p-4">
              {stats.parts.map((p, i) => {
                const cls = p.added
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                  : p.removed
                  ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 line-through decoration-rose-500/50'
                  : 'text-slate-700 dark:text-slate-300'
                // Show the starting line number of every change fragment so
                // the user can jump straight to it in the source file.
                const badge = p.added
                  ? `B:${p.lineB}`
                  : p.removed
                  ? `A:${p.lineA}`
                  : null
                const badgeCls = p.added
                  ? 'bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                  : 'bg-rose-200/70 dark:bg-rose-800/60 text-rose-900 dark:text-rose-100'
                return (
                  <span key={i} className={`${cls} rounded-sm`}>
                    {badge && (
                      <sup
                        className={`mono text-[10px] font-medium ${badgeCls} px-1 py-[1px] rounded mr-0.5 align-super`}
                        title={p.added ? `Added — starts on line ${p.lineB} of Changed (B)` : `Removed — starts on line ${p.lineA} of Original (A)`}
                      >
                        {badge}
                      </sup>
                    )}
                    {visibleWs(p.value)}
                  </span>
                )
              })}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiffChecker
