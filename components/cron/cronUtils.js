export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const clean = (value) => String(value || '').trim().replace(/\s+/g, ' ')
const numberSet = (token, min, max, dayOfWeek = false) => {
  if (token === '*' || token === '?' || token === '') return null
  const result = new Set()
  for (const part of token.split(',')) {
    const [base, stepText] = part.split('/')
    const step = Number(stepText || 1)
    if (!Number.isInteger(step) || step < 1) return null
    let start = base === '*' ? min : Number(base)
    let end = base === '*' || stepText ? max : start
    if (base.includes('-')) {
      const range = base.split('-').map(Number)
      start = range[0]; end = range[1]
    }
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < min || end > max || start > end) return null
    for (let n = start; n <= end; n += step) result.add(n)
  }
  if (dayOfWeek && result.has(7)) result.add(1)
  return result
}

const matches = (value, token, min, max, dayOfWeek = false) => {
  const set = numberSet(token, min, max, dayOfWeek)
  return !set || set.has(value)
}

export const parseExpression = (raw) => {
  const expr = clean(raw)
  const parts = expr.split(' ')
  if (parts.length === 5) return { format: 'Cron', fields: parts, valid: true }
  if (parts.length === 6 || parts.length === 7) return { format: 'Quartz', fields: parts, valid: true }
  return { valid: false, error: 'Use 5 fields for Cron, or 6/7 fields for Quartz (seconds first, year last).' }
}

export const describeExpression = (raw) => {
  const parsed = parseExpression(raw)
  if (!parsed.valid) return { error: parsed.error }
  const f = parsed.fields
  const quartz = parsed.format === 'Quartz'
  const [min, hour, dom, mon, dow] = quartz ? f.slice(1, 6) : f
  const parts = []
  parts.push(min === '*' ? 'every minute' : min.includes('/') ? `every ${min.split('/')[1]} minutes` : `at minute ${min}`)
  if (hour !== '*') parts.push(hour.includes('/') ? `every ${hour.split('/')[1]} hours` : `hour ${hour}`)
  if (dom !== '*' && dom !== '?') parts.push(`day ${dom} of the month`)
  if (dow !== '*' && dow !== '?') parts.push(`weekday ${dow}`)
  if (mon !== '*') parts.push(`month ${mon}`)
  if (quartz && f[0] !== '*') parts.unshift(`second ${f[0]}`)
  if (quartz && f[6]) parts.push(f[6] === '*' ? 'every year' : `year ${f[6]}`)
  return { text: parts.join(', ') + '.', format: parsed.format, expr: clean(raw) }
}

const dateMatches = (date, fields, quartz) => {
  const offset = quartz ? 1 : 0
  const second = date.getSeconds()
  const minute = date.getMinutes()
  const hour = date.getHours()
  const dom = date.getDate()
  const month = date.getMonth() + 1
  const dow = date.getDay() === 0 ? 1 : date.getDay() + 1
  if (quartz && !matches(second, fields[0], 0, 59)) return false
  if (!matches(minute, fields[offset], 0, 59) || !matches(hour, fields[offset + 1], 0, 23)) return false
  if (!matches(month, fields[offset + 3], 1, 12)) return false
  if (fields[offset + 4] !== '?' && !matches(dow, fields[offset + 4], 1, 7, true)) return false
  if (fields[offset + 2] !== '?' && !matches(dom, fields[offset + 2], 1, 31)) return false
  const year = quartz ? fields[6] : '*'
  return matches(date.getFullYear(), year, 1970, 2199)
}

export const nextRuns = (raw, limit = 10, from = new Date()) => {
  const parsed = parseExpression(raw)
  if (!parsed.valid) return { error: parsed.error, runs: [] }
  const quartz = parsed.format === 'Quartz'
  const fields = parsed.fields
  const start = new Date(from)
  start.setMilliseconds(0)
  start.setSeconds(0)
  start.setMinutes(start.getMinutes() + 1)
  const runs = []
  const cursor = new Date(start)
  const maxMinutes = 366 * 24 * 60
  const seconds = quartz ? (numberSet(fields[0], 0, 59) ? [...numberSet(fields[0], 0, 59)] : valuesForSeconds(fields[0])) : [0]
  for (let i = 0; i < maxMinutes && runs.length < limit; i += 1) {
    for (const second of seconds) {
      cursor.setSeconds(second)
      if (dateMatches(cursor, fields, quartz)) runs.push(new Date(cursor))
      if (runs.length >= limit) break
    }
    cursor.setMinutes(cursor.getMinutes() + 1)
  }
  return { runs, format: parsed.format, exhausted: runs.length < limit }
}

const valuesForSeconds = (token) => {
  if (token === '*' || token === '?' || token === '') return Array.from({ length: 60 }, (_, i) => i)
  const value = Number(token)
  return Number.isInteger(value) && value >= 0 && value <= 59 ? [value] : []
}

export const formatRun = (date) => date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })