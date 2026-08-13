// Core formatter/converter utilities used by the Code Formatter Pro UI
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser'
import yaml from 'js-yaml'
import YAML from 'yaml'
import { parse as jsoncParse, stringify as jsoncStringify } from 'comment-json'
import beautify from 'js-beautify'
import { format as sqlFormat } from 'sql-formatter'

// Error helper that includes line/column when known so we can highlight in the UI.
class FormatError extends Error {
  constructor(message, line, col) {
    super(message)
    this.name = 'FormatError'
    if (line) this.line = line
    if (col) this.col = col
  }
}

// ---------- JSON ----------
// JSON formatting is JSONC-aware: `//` line and `/* */` block comments are
// preserved in the beautified output (via comment-json) instead of erroring.
export const formatJSON = (input, indent = 2) => {
  try {
    return jsoncStringify(jsoncParse(input), null, indent)
  } catch (e) {
    const m = /position (\d+)/i.exec(e.message)
    if (m) {
      const pos = Number(m[1])
      const before = input.slice(0, pos)
      const line = before.split('\n').length
      const col = pos - before.lastIndexOf('\n')
      throw new FormatError(`Invalid JSON: ${e.message}`, line, col)
    }
    throw new FormatError(`Invalid JSON: ${e.message}`)
  }
}
export const minifyJSON = (input) => {
  try {
    return JSON.stringify(JSON.parse(input))
  } catch (e) {
    throw new FormatError(`Invalid JSON: ${e.message}`)
  }
}

// ---------- XML ----------
// commentPropName keeps XML comments (<!-- ... -->) intact through parse/build
// so formatting, minifying and converting never strips a comment section.
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', commentPropName: '#comment' })
const xmlBuilder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true, indentBy: '  ', commentPropName: '#comment' })
const xmlBuilderMin = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: false, commentPropName: '#comment' })

// Ordered parser/builders (preserveOrder) keep comments in their EXACT original
// position for complex documents. Used only for XML Formatter / Minifier where
// the output is XML; xmlToJson keeps the non-ordered parser for clean JSON.
const xmlOrderedOpts = { ignoreAttributes: false, attributeNamePrefix: '@_', commentPropName: '#comment', preserveOrder: true }
const xmlParserOrdered = new XMLParser(xmlOrderedOpts)
const xmlBuilderOrdered = new XMLBuilder({ ...xmlOrderedOpts, format: true, indentBy: '  ' })
const xmlBuilderOrderedMin = new XMLBuilder({ ...xmlOrderedOpts, format: false })

// NETCONF / BEEP style message separators. A stream can contain several XML
// documents, each terminated by one of these markers. We treat them purely as
// block delimiters: they never trigger a validation error, and the marker is
// re-emitted after each formatted block. Splitting on them also resolves the
// "Multiple possible root nodes found" error, because each block becomes its
// own single-root document.
//
// Two framing styles are supported and auto-detected:
//   ]]>]]>  — NETCONF 1.0 end-of-message marker (checked first)
//   ]]>     — single-marker framing used by some streams
const XML_END_MARKER = ']]>]]>'
const XML_SINGLE_MARKER = ']]>'

// Auto-detect which framing marker the input uses. CDATA terminators (which
// also end in ]]>) are masked out first so they are never mistaken for a
// framing marker. Prefer the double marker so we never split a ]]>]]> in half.
const CDATA_RE = /<!\[CDATA\[[\s\S]*?\]\]>/g
const detectXmlMarker = (input) => {
  const masked = input.replace(CDATA_RE, '')
  if (masked.includes(XML_END_MARKER)) return XML_END_MARKER
  if (masked.includes(XML_SINGLE_MARKER)) return XML_SINGLE_MARKER
  return null
}

// Matches an XML declaration such as <?xml version="1.0" encoding="UTF-8"?>.
const XML_DECL_RE = /<\?xml[^>]*\?>/gi

// Requirement: an <?xml ...?> declaration is a valid start-of-document and must
// never throw. If the same declaration appears again later in the file, the
// duplicate is silently deleted (only the first is preserved). Returns the
// first declaration (or null) plus the body with every declaration removed.
const extractXmlDeclaration = (input) => {
  const matches = input.match(XML_DECL_RE)
  const firstDecl = matches && matches.length ? matches[0].trim() : null
  const body = input.replace(XML_DECL_RE, '')
  return { firstDecl, body }
}

const validateXML = (input) => {
  const result = XMLValidator.validate(input, { allowBooleanAttributes: true })
  if (result === true) return
  const { code, msg, line, col } = result.err || {}
  const humanised = msg || code || 'Invalid XML'
  throw new FormatError(`XML error: ${humanised}`, line, col)
}

// Split on the given marker into trimmed, non-empty blocks. CDATA sections are
// masked so their internal ]]> terminators are never used as split points.
// When no marker is present the whole input is treated as a single block.
const splitXmlBlocks = (input, marker = detectXmlMarker(input)) => {
  if (!marker) return [input.trim()].filter(Boolean)
  const cdata = []
  const masked = input.replace(CDATA_RE, (m) => {
    cdata.push(m)
    return `\u0000CD${cdata.length - 1}\u0000`
  })
  const unmask = (s) => s.replace(/\u0000CD(\d+)\u0000/g, (_, i) => cdata[Number(i)])
  return masked
    .split(marker)
    .map((b) => unmask(b).trim())
    .filter(Boolean)
}

// Drop the throwaway wrapper element and de-indent one level (2 spaces).
const unwrapRoot = (built) =>
  built
    .split('\n')
    .filter((l) => !/^\s*<\/?__cfp_wrap__>\s*$/.test(l))
    .map((l) => (l.startsWith('  ') ? l.slice(2) : l))
    .join('\n')
    .trim()

// Format a single XML block. Tolerates "multiple possible root nodes" by
// wrapping the block in a throwaway root, formatting, then stripping it.
const formatXmlBlock = (block, minify = false) => {
  const builder = minify ? xmlBuilderOrderedMin : xmlBuilderOrdered
  const result = XMLValidator.validate(block, { allowBooleanAttributes: true })
  if (result === true) {
    const out = builder.build(xmlParserOrdered.parse(block))
    return minify ? out.replace(/\s+/g, ' ').trim() : out.trim()
  }
  const { code, msg, line, col } = result.err || {}
  if (/root/i.test(msg || '')) {
    const wrapped = `<__cfp_wrap__>${block}</__cfp_wrap__>`
    if (XMLValidator.validate(wrapped, { allowBooleanAttributes: true }) === true) {
      const built = builder.build(xmlParserOrdered.parse(wrapped))
      if (minify) return built.replace(/<\/?__cfp_wrap__>/g, '').replace(/\s+/g, ' ').trim()
      return unwrapRoot(built)
    }
  }
  throw new FormatError(`XML error: ${msg || code || 'Invalid XML'}`, line, col)
}

export const formatXML = (input, options = {}) => {
  const { blankLines = false } = options
  const { firstDecl, body } = extractXmlDeclaration(input)
  const marker = detectXmlMarker(body)
  const blocks = splitXmlBlocks(body, marker)
  if (blocks.length === 0) return firstDecl || ''
  const formatted = blocks.map((b) => formatXmlBlock(b, false))
  // Blank-line spacing: insert an empty line between formatted blocks so
  // multi-message streams are easier to scan.
  const sep = blankLines ? '\n\n' : '\n'
  const joined = marker
    ? formatted.map((b) => `${b}\n${marker}`).join(sep)
    : formatted.join(sep)
  return firstDecl ? `${firstDecl}\n${joined}` : joined
}
export const minifyXML = (input, options = {}) => {
  const { blankLines = false } = options
  const { firstDecl, body } = extractXmlDeclaration(input)
  const marker = detectXmlMarker(body)
  const blocks = splitXmlBlocks(body, marker)
  if (blocks.length === 0) return firstDecl || ''
  const minified = blocks.map((b) => formatXmlBlock(b, true))
  const out = marker
    ? minified.map((b) => `${b}${marker}`).join(blankLines ? '\n\n' : '')
    : minified.join(blankLines ? '\n\n' : ' ')
  const joined = out.trim()
  return firstDecl ? `${firstDecl}\n${joined}` : joined
}
export const xmlToJson = (input) => {
  const { body } = extractXmlDeclaration(input)
  const marker = detectXmlMarker(body)
  const blocks = splitXmlBlocks(body, marker)
  // JSON Array Output: when the stream has several marker-delimited blocks,
  // emit a clean JSON array with one parsed object per block.
  if (blocks.length <= 1) {
    const single = blocks[0] ?? body
    validateXML(single)
    return JSON.stringify(xmlParser.parse(single), null, 2)
  }
  const parsed = blocks.map((b) => {
    validateXML(b)
    return xmlParser.parse(b)
  })
  return JSON.stringify(parsed, null, 2)
}
export const jsonToXml = (input) => {
  try {
    return xmlBuilder.build(JSON.parse(input))
  } catch (e) {
    throw new FormatError(`Invalid JSON: ${e.message}`)
  }
}

// ---------- YAML ----------
const wrapYamlError = (fn) => (input) => {
  try {
    return fn(input)
  } catch (e) {
    // js-yaml throws YAMLException with mark.line/column
    const mark = e && e.mark
    if (mark) throw new FormatError(`Invalid YAML: ${e.reason || e.message}`, (mark.line || 0) + 1, (mark.column || 0) + 1)
    throw new FormatError(`Invalid YAML: ${e.message}`)
  }
}
// YAML formatting uses the comment-preserving `yaml` package (Document API)
// so `#` comments survive a reformat. js-yaml is still used for conversions
// where the target format (JSON) has no comment syntax.
export const formatYAML = (input) => {
  try {
    const doc = YAML.parseDocument(input)
    if (doc.errors && doc.errors.length) {
      const err = doc.errors[0]
      const pos = err.linePos && err.linePos[0]
      throw new FormatError(`Invalid YAML: ${err.message}`, pos && pos.line, pos && pos.col)
    }
    return doc.toString({ indent: 2, lineWidth: 0 })
  } catch (e) {
    if (e instanceof FormatError) throw e
    const mark = e && e.mark
    if (mark) throw new FormatError(`Invalid YAML: ${e.reason || e.message}`, (mark.line || 0) + 1, (mark.column || 0) + 1)
    throw new FormatError(`Invalid YAML: ${e.message}`)
  }
}
export const yamlToJson = wrapYamlError((input) => JSON.stringify(yaml.load(input), null, 2))
export const jsonToYaml = (input) => {
  try {
    return yaml.dump(JSON.parse(input), { indent: 2 })
  } catch (e) {
    throw new FormatError(`Invalid JSON: ${e.message}`)
  }
}

// ---------- HTML / CSS / JS ----------
// The three "beautifier" pipelines still use js-beautify because it produces
// idiomatic, Prettier-compatible output for user-authored source.
export const formatHTML = (input) =>
  beautify.html(input, { indent_size: 2, wrap_line_length: 120, preserve_newlines: true })
export const formatCSS = (input) => beautify.css(input, { indent_size: 2 })
export const formatJS = (input) =>
  beautify.js(input, { indent_size: 2, space_in_empty_paren: true })

// Minifiers use real, battle-tested libraries loaded on demand so the
// initial bundle stays small. Each throws a FormatError with line/col
// where available so the UI can highlight the offending line.
export const minifyJS = async (input) => {
  const { minify } = await import('terser')
  try {
    const result = await minify(input, {
      compress: true,
      mangle: false,           // keep identifiers stable — safer for demos
      format: { comments: false },
      sourceMap: false,
    })
    return result.code || ''
  } catch (e) {
    // terser errors carry .line and .col
    const line = e && (e.line || (e.loc && e.loc.line))
    const col = e && (e.col || (e.loc && e.loc.column))
    throw new FormatError(`Invalid JavaScript: ${e.message}`, line, col)
  }
}

export const minifyCSS = async (input) => {
  // csso is browser-friendly and preserves selector semantics.
  const cssoModule = await import('csso')
  const csso = cssoModule.default || cssoModule
  try {
    return csso.minify(input, { restructure: true }).css
  } catch (e) {
    throw new FormatError(`Invalid CSS: ${e.message}`)
  }
}

export const minifyHTML = async (input) => {
  try {
    const { minify: terserMinify } = await import('terser')
    const cssoModule = await import('csso')
    const csso = cssoModule.default || cssoModule

    // Step 1 — minify each inline <script> body (JS types only) in place.
    const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
    const scriptChunks = []
    let m
    while ((m = scriptRe.exec(input)) !== null) {
      scriptChunks.push({ index: m.index, full: m[0], attrs: m[1], body: m[2] })
    }
    // Rebuild input with minified script bodies.
    let src = ''
    let cursor = 0
    for (const c of scriptChunks) {
      src += input.slice(cursor, c.index)
      let body = c.body
      const isJs = !/type\s*=\s*['"](?!(?:text\/javascript|application\/javascript|module))[^'"]+['"]/i.test(c.attrs)
      if (isJs && body.trim()) {
        try {
          const r = await terserMinify(body, { compress: true, mangle: false, format: { comments: false } })
          if (r.code) body = r.code
        } catch { /* leave inline script untouched on error */ }
      }
      src += `<script${c.attrs}>${body}</script>`
      cursor = c.index + c.full.length
    }
    src += input.slice(cursor)

    // Step 2 — minify inline <style> content via csso.
    src = src.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_, attrs, body) => {
      try { return `<style${attrs}>${csso.minify(body).css}</style>` }
      catch { return `<style${attrs}>${body}</style>` }
    })

    // Step 3 — protect segments whose whitespace must be preserved verbatim
    // (script/style bodies just minified, plus pre/textarea/code text).
    const SAFE_RE = /<(script|style|pre|textarea|code)\b[^>]*>[\s\S]*?<\/\1>/gi
    const safe = []
    src = src.replace(SAFE_RE, (m2) => {
      safe.push(m2)
      return `\u0000SAFE${safe.length - 1}\u0000`
    })

    // Step 4 — strip plain HTML comments but preserve IE conditional comments.
    src = src.replace(/<!--(?!\[if )[\s\S]*?-->/g, '')

    // Step 5 — collapse whitespace safely: kill it between tags, and reduce
    // runs of 2+ whitespace chars in text nodes to a single space.
    src = src.replace(/>\s+</g, '><').replace(/[ \t\r\n]{2,}/g, ' ').trim()

    // Step 6 — restore the protected segments.
    return src.replace(/\u0000SAFE(\d+)\u0000/g, (_, i) => safe[Number(i)])
  } catch (e) {
    throw new FormatError(`Could not minify HTML: ${e.message}`)
  }
}

// ---------- SQL ----------
export const formatSQL = (input) => sqlFormat(input, { language: 'sql', tabWidth: 2, keywordCase: 'upper' })

// ---------- CSV ↔ JSON ----------
// Delimiter-aware CSV parser. Correctly handles quoted fields that contain
// commas / newlines / escaped quotes (RFC 4180). Delimiter can be ',' ';' or '\t'.
export const parseCSV = (input, delimiter = ',') => {
  const rows = []
  let row = []
  let cur = ''
  let inQuotes = false
  const text = input.replace(/\r\n/g, '\n')
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++ } else inQuotes = false
      } else cur += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === delimiter) { row.push(cur); cur = '' }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' }
      else cur += c
    }
  }
  // Push last cell / row (unless the input ended cleanly with a newline)
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row) }
  return rows
}

export const csvToJson = (input, delimiter = ',') => {
  const trimmed = input.replace(/\s+$/, '')
  if (!trimmed) return '[]'
  const rows = parseCSV(trimmed, delimiter)
  if (!rows.length) return '[]'
  const headers = rows[0]
  const out = rows.slice(1).map((vals) => {
    const obj = {}
    headers.forEach((h, i) => (obj[h] = vals[i] !== undefined ? vals[i] : ''))
    return obj
  })
  return JSON.stringify(out, null, 2)
}
export const jsonToCsv = (input) => {
  let raw
  try { raw = JSON.parse(input) } catch (e) { throw new FormatError(`Invalid JSON: ${e.message}`) }

  let data = raw
  if (data && !Array.isArray(data) && typeof data === 'object') {
    const arrayKey = Object.keys(data).find((k) => Array.isArray(data[k]))
    if (arrayKey) data = data[arrayKey]
    else data = [data]
  }
  if (!Array.isArray(data)) throw new Error('Input must be a JSON object, an array of objects, or an object wrapping an array.')
  if (data.length === 0) throw new Error('Input array is empty — nothing to convert.')

  const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
  const flatten = (obj, prefix = '', out = {}) => {
    for (const k of Object.keys(obj)) {
      const key = prefix ? `${prefix}.${k}` : k
      const v = obj[k]
      if (isPlainObject(v)) flatten(v, key, out)
      else if (Array.isArray(v)) out[key] = JSON.stringify(v)
      else out[key] = v
    }
    return out
  }

  const flatRows = data.map((row) => (isPlainObject(row) ? flatten(row) : { value: row }))

  const headers = []
  const seen = new Set()
  for (const r of flatRows) for (const k of Object.keys(r)) if (!seen.has(k)) { seen.add(k); headers.push(k) }

  const esc = (v) => {
    if (v === null || v === undefined) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = flatRows.map((r) => headers.map((h) => esc(r[h])).join(','))
  return [headers.join(','), ...rows].join('\n')
}

// ---------- Encoders ----------
// Modern base64 helpers using TextEncoder / TextDecoder — safe for 4-byte
// characters (emoji, CJK supplementary planes) that the deprecated
// unescape(encodeURIComponent(...)) trick used to choke on.
const _bytesToBase64 = (bytes) => {
  if (typeof btoa !== 'undefined') {
    let bin = ''
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
    return btoa(bin)
  }
  return Buffer.from(bytes).toString('base64')
}
const _base64ToBytes = (str) => {
  if (typeof atob !== 'undefined') {
    const bin = atob(str)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
  }
  return new Uint8Array(Buffer.from(str, 'base64'))
}

export const base64Encode = (input) => _bytesToBase64(new TextEncoder().encode(input))
export const base64Decode = (input) => new TextDecoder().decode(_base64ToBytes(input))
export const urlEncode = (input) => encodeURIComponent(input)
export const urlDecode = (input) => decodeURIComponent(input)
export const htmlEntityEncode = (input) =>
  input.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
export const htmlEntityDecode = (input) =>
  input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

export const jwtDecode = (input) => {
  const parts = input.trim().split('.')
  if (parts.length < 2) throw new Error('Invalid JWT token')
  const decode = (str) => {
    const pad = str + '='.repeat((4 - (str.length % 4)) % 4)
    const b64 = pad.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(base64Decode(b64))
  }
  return JSON.stringify({ header: decode(parts[0]), payload: decode(parts[1]) }, null, 2)
}

// ---------- Text tools ----------
export const toUpper = (i) => i.toUpperCase()
export const toLower = (i) => i.toLowerCase()
export const toTitle = (i) => i.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
export const reverseText = (i) => i.split('').reverse().join('')
export const removeWhitespace = (i) => i.replace(/\s+/g, '')
// Collapse runs of spaces/tabs between words into a single space and trim each
// line's ends, while keeping every line break (structure) intact.
export const cleanSpaces = (i) =>
  i.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).join('\n')
export const wordCount = (i) => {
  const chars = i.length
  const charsNoSpace = i.replace(/\s/g, '').length
  const words = (i.trim().match(/\S+/g) || []).length
  const lines = i.split(/\r?\n/).length
  return `Characters: ${chars}\nCharacters (no spaces): ${charsNoSpace}\nWords: ${words}\nLines: ${lines}`
}

// ---------- Generators ----------
export const generateUUIDs = (count = 5) => {
  const arr = []
  for (let i = 0; i < count; i++) arr.push(crypto.randomUUID())
  return arr.join('\n')
}
export const timestampConvert = (input) => {
  const trimmed = input.trim()
  if (!trimmed) {
    const now = Date.now()
    return `Now:\n  Unix (ms): ${now}\n  Unix (s):  ${Math.floor(now / 1000)}\n  ISO:       ${new Date(now).toISOString()}`
  }
  const num = Number(trimmed)
  if (!isNaN(num)) {
    const ms = trimmed.length <= 10 ? num * 1000 : num
    const d = new Date(ms)
    return `ISO:   ${d.toISOString()}\nUTC:   ${d.toUTCString()}\nLocal: ${d.toString()}`
  }
  const d = new Date(trimmed)
  if (isNaN(d.getTime())) throw new Error('Invalid date/timestamp')
  return `Unix (ms): ${d.getTime()}\nUnix (s):  ${Math.floor(d.getTime() / 1000)}\nISO:       ${d.toISOString()}`
}

// ---------- Hash ----------
export const sha256 = async (input) => {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
export const sha1 = async (input) => {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-1', buf)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
