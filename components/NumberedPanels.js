'use client'

import { useMemo, useRef } from 'react'

// Escape helper reused by the read-only output renderer below.
const escHtml = (s) => (s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))

// Build the gutter text as a single string so the DOM stays O(1) regardless
// of line count. When errorLine is set we split the text into up to three
// text nodes (before, the errored line, after) so we only have to insert one
// styled span instead of `lineCount` divs. This lets the gutter scale to
// hundreds of thousands of lines without freezing the browser.
const GutterContent = ({ lineCount, errorLine }) => {
  const parts = useMemo(() => {
    if (!errorLine || errorLine < 1 || errorLine > lineCount) {
      const nums = new Array(lineCount)
      for (let i = 0; i < lineCount; i++) nums[i] = i + 1
      return { before: nums.join('\n'), err: null, after: '' }
    }
    const beforeNums = new Array(errorLine - 1)
    for (let i = 0; i < errorLine - 1; i++) beforeNums[i] = i + 1
    const afterNums = new Array(lineCount - errorLine)
    for (let i = 0; i < afterNums.length; i++) afterNums[i] = errorLine + 1 + i
    return {
      before: beforeNums.length ? beforeNums.join('\n') + '\n' : '',
      err: String(errorLine),
      after: afterNums.length ? '\n' + afterNums.join('\n') : '',
    }
  }, [lineCount, errorLine])

  if (!parts.err) return <>{parts.before}</>
  return (
    <>
      {parts.before}
      <span className="text-rose-600 dark:text-rose-400 font-bold">{parts.err}</span>
      {parts.after}
    </>
  )
}

/**
 * Textarea with a synchronised line-number gutter (Notepad++ style).
 * The gutter and the textarea scroll together; the textarea has a
 * transparent background so the line numbers line up seamlessly.
 *
 * When `errorLine` is provided the corresponding gutter number is
 * highlighted in red so the user can jump straight to the mistake.
 *
 * Perf: the gutter is a single <pre> holding a text node instead of one
 * <div> per line, so pasting a 100 000-line file keeps the browser snappy.
 */
export const NumberedTextarea = ({ value, onChange, placeholder, errorLine, minHeight = 380 }) => {
  const taRef = useRef(null)
  const gutterRef = useRef(null)
  const lineCount = useMemo(() => Math.max(1, (value.match(/\n/g)?.length || 0) + 1), [value])

  const onScroll = () => {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop
    }
  }

  return (
    <div className="flex flex-1 min-h-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <pre
        ref={gutterRef}
        aria-hidden="true"
        className="mono select-none text-right px-2 py-4 text-[13px] leading-[1.5] text-slate-400 dark:text-slate-600 bg-slate-100/70 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 overflow-hidden m-0 whitespace-pre"
        style={{ minWidth: 48 }}
      >
        <GutterContent lineCount={lineCount} errorLine={errorLine} />
      </pre>
      <textarea
        ref={taRef}
        value={value}
        onChange={onChange}
        onScroll={onScroll}
        placeholder={placeholder}
        spellCheck={false}
        className="mono flex-1 py-4 px-3 text-[15px] leading-[1.5] bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none resize-none w-full"
        style={{ minHeight }}
      />
    </div>
  )
}

/**
 * Read-only output panel that mirrors NumberedTextarea's gutter behaviour but
 * renders syntax-highlighted HTML instead of an editable textarea.
 */
export const NumberedOutput = ({ text, html, minHeight = 380 }) => {
  const preRef = useRef(null)
  const gutterRef = useRef(null)
  const lineCount = useMemo(() => Math.max(1, ((text || '').match(/\n/g)?.length || 0) + 1), [text])

  const onScroll = () => {
    if (gutterRef.current && preRef.current) gutterRef.current.scrollTop = preRef.current.scrollTop
  }

  return (
    <div className="flex flex-1 min-h-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <pre
        ref={gutterRef}
        aria-hidden="true"
        className="mono select-none text-right px-2 py-4 text-[13px] leading-[1.5] text-slate-400 dark:text-slate-600 bg-slate-100/70 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 overflow-hidden m-0 whitespace-pre"
        style={{ minWidth: 48 }}
      >
        <GutterContent lineCount={lineCount} errorLine={null} />
      </pre>
      <pre
        ref={preRef}
        onScroll={onScroll}
        className="mono flex-1 py-4 px-3 text-[15px] leading-[1.5] whitespace-pre-wrap break-words overflow-auto"
        style={{ minHeight }}
      >
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html || escHtml(text) }} />
      </pre>
    </div>
  )
}
