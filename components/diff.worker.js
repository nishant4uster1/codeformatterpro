// Web-worker that owns all diff computation so the main thread stays free.
// Without this, diffLines / diffWordsWithSpace on 30 MB inputs blocks the UI
// long enough that Chrome shows the "Page isn't responding" prompt.
//
// The worker also strips a common line-prefix and line-suffix before running
// line-diff so nearly-identical files only pay for the changed middle.

import { diffLines, diffWordsWithSpace } from 'diff'

// Strip identical lines from the start and end of two files. Returns the
// stripped middles (still as arrays of lines) plus the raw prefix/suffix
// arrays so the caller can prepend / append them as single unchanged parts.
const stripCommonLines = (aLines, bLines) => {
  const minLen = Math.min(aLines.length, bLines.length)
  let prefix = 0
  while (prefix < minLen && aLines[prefix] === bLines[prefix]) prefix++
  let suffix = 0
  const cap = minLen - prefix
  while (
    suffix < cap &&
    aLines[aLines.length - 1 - suffix] === bLines[bLines.length - 1 - suffix]
  ) suffix++
  return {
    prefixLines: aLines.slice(0, prefix),
    aCoreLines: aLines.slice(prefix, aLines.length - suffix),
    bCoreLines: bLines.slice(prefix, bLines.length - suffix),
    suffixLines: aLines.slice(aLines.length - suffix),
  }
}

// Wrap an array of lines back into a `diff`-shaped part with a trailing
// newline so the concatenation matches what diffLines(entireFile) would
// have emitted. Returns null if the array is empty so we don't push a
// zero-length part.
const linesToPart = (lines, kind) => {
  if (!lines.length) return null
  // Drop the "phantom" trailing '' that string.split('\n') produces for
  // files that end in a newline; the '\n' we add back below restores it.
  const clean = lines[lines.length - 1] === '' ? lines.slice(0, -1) : lines
  if (!clean.length) return null
  const part = { value: clean.join('\n') + '\n', count: clean.length }
  if (kind === 'added') part.added = true
  else if (kind === 'removed') part.removed = true
  return part
}

self.onmessage = (event) => {
  const { id, mode, left, right, ignoreCase, ignoreLeadTrail } = event.data
  try {
    let l = left
    let r = right
    if (ignoreLeadTrail) {
      l = l.split('\n').map((s) => s.trim()).join('\n')
      r = r.split('\n').map((s) => s.trim()).join('\n')
    }
    if (ignoreCase) { l = l.toLowerCase(); r = r.toLowerCase() }

    if (mode === 'word') {
      // Word-diff can't be trimmed line-wise; run it straight.
      const parts = diffWordsWithSpace(l, r)
      self.postMessage({ id, ok: true, parts, mode: 'word' })
      return
    }

    // Line mode: strip identical top/bottom so diffLines only has to work
    // on the changed middle. On near-identical big files this is the
    // difference between minutes of computation and milliseconds.
    const aLines = l.split('\n')
    const bLines = r.split('\n')
    const { prefixLines, aCoreLines, bCoreLines, suffixLines } = stripCommonLines(aLines, bLines)

    const aCore = aCoreLines.join('\n')
    const bCore = bCoreLines.join('\n')
    const middle = aCore === bCore ? [] : diffLines(aCore, bCore, { newlineIsToken: false })

    const parts = []
    const pre = linesToPart(prefixLines, 'eq')
    if (pre) parts.push(pre)
    for (const p of middle) parts.push(p)
    const suf = linesToPart(suffixLines, 'eq')
    if (suf) parts.push(suf)

    self.postMessage({ id, ok: true, parts, mode: 'line' })
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err), mode })
  }
}
