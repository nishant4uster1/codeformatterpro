'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, Check, ChevronDown, Clock3, Copy, Hash, RotateCcw, Sparkles } from 'lucide-react'
import { useClipboardFlag } from '@/components/hooks'
import { describeExpression, formatRun, MONTHS, nextRuns, parseExpression, WEEKDAYS } from '@/components/cron/cronUtils'

const pad = (value) => String(value).padStart(2, '0')
const values = (max, start = 0) => Array.from({ length: max - start + 1 }, (_, i) => i + start)
const join = (items) => items.length ? items.join(',') : '*'

function MultiValueSelect({ label, testId, options, selected, onChange, helper }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])
  const toggle = (value) => onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value].sort((a, b) => a - b))
  return <div ref={containerRef} className="relative" data-testid={`${testId}-group`}>
    <label className="workshop-label">{label}</label>
    <button type="button" data-testid={`${testId}-trigger`} onClick={() => setOpen(!open)} className="field-input flex w-full items-center justify-between text-left">
      <span className="mono truncate">{selected.length ? selected.join(', ') : 'Any value'}</span><ChevronDown className="h-4 w-4 shrink-0" />
    </button>
    {helper && <div className="field-helper">{helper}</div>}
    {open && <div className="multi-menu" data-testid={`${testId}-menu`}>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2 text-xs uppercase tracking-[.16em] text-[var(--muted)]"><span>Select values</span><button type="button" data-testid={`${testId}-clear`} onClick={() => onChange([])}>Clear</button></div>
      <div className="grid max-h-48 grid-cols-4 gap-1 overflow-auto p-2">{options.map((option) => <button type="button" key={option.value} data-testid={`${testId}-option-${option.value}`} aria-pressed={selected.includes(option.value)} onClick={() => toggle(option.value)} className={`choice-chip ${selected.includes(option.value) ? 'choice-chip-active' : ''}`}>{option.label}</button>)}</div>
    </div>}
  </div>
}

function Field({ label, value, onChange, testId, placeholder = '*', helper }) {
  return <div><label className="workshop-label" htmlFor={testId}>{label}</label><input id={testId} data-testid={testId} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-input mono w-full" />{helper && <div className="field-helper">{helper}</div>}</div>
}

function UpcomingRuns({ expression, testId = 'upcoming-runs', title = 'Next eligible timestamps' }) {
  const result = useMemo(() => nextRuns(expression), [expression])
  return <section className="ledger" aria-live="polite" data-testid={testId}>
    <div className="flex items-start justify-between gap-3"><div><div className="eyebrow">Run ledger</div><h3 className="section-title">{title}</h3></div><span className="format-badge" data-testid={`${testId}-count`}>{result.runs.length}/10</span></div>
    {result.error ? <div className="status-error" data-testid={`${testId}-error`}>{result.error}</div> : result.runs.length ? <ol className="mt-4 space-y-2">{result.runs.map((run, index) => <li key={run.toISOString()} data-testid={`${testId}-${index}`} className="run-row"><span className="run-index">{pad(index + 1)}</span><span className="mono">{formatRun(run)}</span></li>)}</ol> : <div className="status-error mt-4" data-testid={`${testId}-empty`}>No eligible timestamps found in the next year.</div>}
  </section>
}

export default function CronTool() {
  const [tab, setTab] = useState('cron')
  const [freq, setFreq] = useState('daily')
  const [minuteInterval, setMinuteInterval] = useState('5')
  const [hourInterval, setHourInterval] = useState('1')
  const [time, setTime] = useState('09:00')
  const [weekdays, setWeekdays] = useState([1])
  const [dom, setDom] = useState([1])
  const [month, setMonth] = useState([1])
  const [decodeInput, setDecodeInput] = useState('0 30/15 15/3 ? * * *')
  const [quartz, setQuartz] = useState({ seconds: '0', minutes: [30], hours: [15], dom: [], month: [], dow: [], year: '*' })
  const [repeat, setRepeat] = useState({ minutes: true, minuteStart: '30', minuteStep: '15', hours: true, hourStart: '15', hourStep: '3' })
  const copy = useClipboardFlag(1800)

  const builtCron = useMemo(() => { const [h, m] = time.split(':').map(Number); const min = freq === 'minutes' ? `*/${Math.max(1, Number(minuteInterval) || 1)}` : String(m); const hour = freq === 'hourly' ? (Number(hourInterval) === 1 ? '*' : `${h}/${Math.max(1, Number(hourInterval) || 1)}`) : String(h); if (freq === 'weekly') return `${min} ${hour} * * ${join(weekdays)}`; if (freq === 'monthly') return `${min} ${hour} ${join(dom)} * *`; if (freq === 'yearly') return `${min} ${hour} ${join(dom)} ${join(month)} *`; return `${min} ${hour} * * *` }, [freq, minuteInterval, hourInterval, time, weekdays, dom, month])
  const builtQuartz = useMemo(() => `${quartz.seconds || '*'} ${repeat.minutes ? `${repeat.minuteStart}/${repeat.minuteStep}` : join(quartz.minutes)} ${repeat.hours ? `${repeat.hourStart}/${repeat.hourStep}` : join(quartz.hours)} ${quartz.dom.length ? join(quartz.dom) : '?'} ${join(quartz.month)} ${quartz.dow.length ? join(quartz.dow) : '*'} ${quartz.year || '*'}`, [quartz, repeat])
  const expression = tab === 'cron' ? builtCron : builtQuartz
  const decoded = useMemo(() => decodeInput.trim() ? describeExpression(decodeInput) : null, [decodeInput])
  const toggleDay = (day) => setWeekdays((old) => old.includes(day) ? old.filter((x) => x !== day) : [...old, day].sort())
  const resetQuartz = () => { setQuartz({ seconds: '0', minutes: [30], hours: [15], dom: [], month: [], dow: [], year: '*' }); setRepeat({ minutes: true, minuteStart: '30', minuteStep: '15', hours: true, hourStart: '15', hourStep: '3' }) }
  const setRepeatValue = (key, value) => setRepeat((old) => ({ ...old, [key]: value }))

  return <div className="cron-tool" data-testid="cron-tool">
    <header className="workshop-header"><div className="eyebrow">Schedule workshop / developer utility</div><h2 className="workshop-title">Cron, with room for precision.</h2><p className="workshop-intro">Author a familiar five-field schedule or a Quartz expression with seconds, calendar rules, and a year — then inspect the next ten runs.</p></header>
    <div className="cron-layout">
      <section className="builder-panel" data-testid="cron-builder-panel">
        <div className="tab-strip" role="tablist" data-testid="cron-mode-tabs"><button role="tab" aria-selected={tab === 'cron'} data-testid="cron-tab" onClick={() => setTab('cron')} className={`mode-tab ${tab === 'cron' ? 'mode-tab-active' : ''}`}>Standard Cron <span>5 fields</span></button><button role="tab" aria-selected={tab === 'quartz'} data-testid="quartz-tab" onClick={() => setTab('quartz')} className={`mode-tab ${tab === 'quartz' ? 'mode-tab-active' : ''}`}>Quartz Cron <span>6 / 7 fields</span></button></div>
        {tab === 'cron' ? <div className="space-y-6" data-testid="standard-cron-builder"><div className="field-grid">{['minutes', 'hourly', 'daily', 'weekly', 'monthly', 'yearly'].map((id) => <button key={id} type="button" data-testid={`cron-frequency-${id}`} onClick={() => setFreq(id)} className={`frequency-button ${freq === id ? 'frequency-button-active' : ''}`}>{id}</button>)}</div><div className="field-grid">{freq === 'minutes' && <Field label="Repeat after minutes" testId="cron-minute-interval" value={minuteInterval} onChange={setMinuteInterval} placeholder="5" helper="1–59 minutes" />}{freq === 'hourly' && <Field label="Repeat after hours" testId="cron-hour-interval" value={hourInterval} onChange={setHourInterval} placeholder="1" helper="Starts at the selected time" />}{freq !== 'minutes' && <div><label className="workshop-label" htmlFor="cron-time">Starts at</label><input id="cron-time" data-testid="cron-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field-input mono w-full" /></div>}{freq === 'weekly' && <fieldset className="col-span-full"><legend className="workshop-label">Weekdays</legend><div className="weekday-grid">{WEEKDAYS.map((day, index) => <label key={day} className={`weekday-choice ${weekdays.includes(index) ? 'weekday-choice-active' : ''}`}><input type="checkbox" data-testid={`cron-weekday-${index}`} checked={weekdays.includes(index)} onChange={() => toggleDay(index)} />{day.slice(0, 3)}</label>)}</div></fieldset>}{(freq === 'monthly' || freq === 'yearly') && <MultiValueSelect label="Days of month" testId="cron-dom" options={values(31, 1).map((v) => ({ value: v, label: v }))} selected={dom} onChange={setDom} />}{freq === 'yearly' && <MultiValueSelect label="Months" testId="cron-month" options={values(12, 1).map((v) => ({ value: v, label: MONTHS[v - 1].slice(0, 3) }))} selected={month} onChange={setMonth} />}</div></div> : <div className="space-y-6" data-testid="quartz-cron-builder"><div className="quartz-note"><Hash className="h-5 w-5" /><span>Quartz order: seconds · minutes · hours · day of month · month · day of week · year</span></div><div className="field-grid"><Field label="Seconds" testId="quartz-seconds" value={quartz.seconds} onChange={(v) => setQuartz({ ...quartz, seconds: v })} helper="0–59 or a Quartz pattern" /><MultiValueSelect label="Months" testId="quartz-month" options={values(12, 1).map((v) => ({ value: v, label: MONTHS[v - 1].slice(0, 3) }))} selected={quartz.month} onChange={(v) => setQuartz({ ...quartz, month: v })} /><MultiValueSelect label="Minutes" testId="quartz-minutes" options={values(59).map((v) => ({ value: v, label: v }))} selected={quartz.minutes} onChange={(v) => setQuartz({ ...quartz, minutes: v })} helper="Select multiple values or use repeat below" /><MultiValueSelect label="Hours" testId="quartz-hours" options={values(23).map((v) => ({ value: v, label: v }))} selected={quartz.hours} onChange={(v) => setQuartz({ ...quartz, hours: v })} /><MultiValueSelect label="Days of month" testId="quartz-dom" options={values(31, 1).map((v) => ({ value: v, label: v }))} selected={quartz.dom} onChange={(v) => setQuartz({ ...quartz, dom: v })} helper="Empty means ?" /><fieldset className="col-span-full"><legend className="workshop-label">Days of week</legend><div className="weekday-grid">{WEEKDAYS.map((day, index) => <label key={day} className={`weekday-choice ${quartz.dow.includes(index + 1) ? 'weekday-choice-active' : ''}`}><input type="checkbox" data-testid={`quartz-weekday-${index + 1}`} checked={quartz.dow.includes(index + 1)} onChange={() => setQuartz({ ...quartz, dow: quartz.dow.includes(index + 1) ? quartz.dow.filter((x) => x !== index + 1) : [...quartz.dow, index + 1].sort() })} />{day.slice(0, 3)}</label>)}</div></fieldset><Field label="Year" testId="quartz-year" value={quartz.year} onChange={(v) => setQuartz({ ...quartz, year: v })} placeholder="* or 2026" /></div><div className="repeat-box"><div className="eyebrow">Repeat-after controls</div><div className="grid gap-4 md:grid-cols-2"><label className="repeat-control"><input type="checkbox" data-testid="quartz-repeat-minutes-toggle" checked={repeat.minutes} onChange={(e) => setRepeatValue('minutes', e.target.checked)} /><span>Every</span><input data-testid="quartz-repeat-minute-start" value={repeat.minuteStart} onChange={(e) => setRepeatValue('minuteStart', e.target.value)} className="mini-input mono" /><span>minutes after</span><input data-testid="quartz-repeat-minute-step" value={repeat.minuteStep} onChange={(e) => setRepeatValue('minuteStep', e.target.value)} className="mini-input mono" /></label><label className="repeat-control"><input type="checkbox" data-testid="quartz-repeat-hours-toggle" checked={repeat.hours} onChange={(e) => setRepeatValue('hours', e.target.checked)} /><span>Every</span><input data-testid="quartz-repeat-hour-start" value={repeat.hourStart} onChange={(e) => setRepeatValue('hourStart', e.target.value)} className="mini-input mono" /><span>hours after</span><input data-testid="quartz-repeat-hour-step" value={repeat.hourStep} onChange={(e) => setRepeatValue('hourStep', e.target.value)} className="mini-input mono" /></label></div></div></div>}
        <div className="expression-band"><div className="flex items-center justify-between gap-3"><div className="eyebrow">Generated expression</div><div className="flex gap-2"><button type="button" data-testid="quartz-reset" onClick={resetQuartz} className="icon-button" title="Reset Quartz fields"><RotateCcw className="h-4 w-4" /></button><button type="button" data-testid="cron-copy" onClick={() => copy.copy(expression)} className="copy-button">{copy.copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copy.copied ? 'Copied' : 'Copy'}</button></div></div><div className="expression mono" data-testid="cron-output">{expression}</div><div className="expression-description" data-testid="cron-output-description"><Sparkles className="h-4 w-4 shrink-0" />{describeExpression(expression).text}</div></div>
        <UpcomingRuns expression={expression} testId="builder-upcoming-runs" title="Next 10 iterations" />
      </section>
      <aside className="decoder-column"><section className="decoder-panel" data-testid="shared-decoder"><div className="eyebrow">Shared decoder</div><h3 className="section-title">Read any schedule</h3><p className="field-helper mb-4">Auto-detects standard Cron and 6/7-field Quartz.</p><label className="workshop-label" htmlFor="cron-decode-input">Expression to decode</label><input id="cron-decode-input" data-testid="cron-decode-input" value={decodeInput} onChange={(e) => setDecodeInput(e.target.value)} className="field-input mono w-full" placeholder="0 30/15 15/3 ? * * *" spellCheck="false" />{decoded && <div className="mt-4" aria-live="polite" data-testid="cron-decode-status">{decoded.error ? <div className="status-error" data-testid="cron-decode-error">{decoded.error}</div> : <><span className="format-badge" data-testid="cron-format-badge">{decoded.format}</span><p className="decode-text" data-testid="cron-decode-output">{decoded.text}</p></>}</div>}</section><UpcomingRuns expression={decodeInput} /></aside>
    </div>
  </div>
}