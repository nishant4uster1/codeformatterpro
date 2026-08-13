'use client'

import dynamic from 'next/dynamic'

// The main workspace is rendered client-only to sidestep hydration mismatches
// caused by browser extensions (password managers, autofillers) injecting
// attributes like `fdprocessedid` on form controls before React hydrates.
const CodeFormatterApp = dynamic(() => import('@/components/CodeFormatterApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30 animate-pulse">
          <span className="text-white text-2xl font-bold">{'{ }'}</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400">Loading Code Formatter Pro…</div>
      </div>
    </div>
  ),
})

export default function Page() {
  return <CodeFormatterApp />
}
