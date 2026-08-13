import { Braces, FileCode2, ArrowLeftRight, LockKeyhole, Type, Wand2, Sparkles, Check, Zap, Shield } from 'lucide-react'

// Rich SEO content block appended right before the footer. This is what fixes
// Semrush's "low word count" and "low text-HTML ratio" warnings, and gives
// Google enough context to rank the page for target keywords like
// "json formatter", "xml to json", "yaml to json", "diff checker" etc.

const CATEGORIES = [
  {
    icon: Braces,
    title: 'Formatters & Beautifiers',
    color: 'from-blue-500 to-cyan-500',
    desc: 'Turn compact or ugly code into human-readable, properly indented markup. Ideal for debugging API responses, reviewing configuration files, or preparing snippets for documentation.',
    tools: ['JSON Formatter', 'XML Formatter', 'HTML Formatter', 'CSS Formatter', 'JavaScript Formatter', 'SQL Formatter', 'YAML Formatter'],
  },
  {
    icon: FileCode2,
    title: 'Minifiers',
    color: 'from-emerald-500 to-teal-500',
    desc: 'Compress your code by stripping whitespace and comments. Smaller files load faster in production, save bandwidth, and improve Core Web Vitals for your users.',
    tools: ['JSON Minifier', 'XML Minifier', 'HTML Minifier', 'CSS Minifier', 'JavaScript Minifier'],
  },
  {
    icon: ArrowLeftRight,
    title: 'Converters',
    color: 'from-violet-500 to-fuchsia-500',
    desc: 'Move data between the formats you actually work with — JSON, XML, YAML, and CSV — without losing structure or type information.',
    tools: ['XML to JSON', 'JSON to XML', 'YAML to JSON', 'JSON to YAML', 'CSV to JSON', 'JSON to CSV', 'XML to YAML', 'YAML to XML'],
  },
  {
    icon: LockKeyhole,
    title: 'Encoders & Decoders',
    color: 'from-amber-500 to-orange-500',
    desc: 'Encode and decode strings for URLs, HTML embedding, or safe transport. Debug JWT tokens without paste-into-third-party-site anxiety.',
    tools: ['Base64 Encode / Decode', 'URL Encode / Decode', 'HTML Entity Encode / Decode', 'JWT Decoder'],
  },
  {
    icon: Type,
    title: 'Text Tools',
    color: 'from-rose-500 to-pink-500',
    desc: 'Clean up strings, change case, count words and lines, remove whitespace, or reverse text. Everything you reach for when preparing content, without leaving the tab.',
    tools: ['Uppercase / Lowercase / Title Case', 'Reverse Text', 'Remove Whitespace', 'Word and Character Counter'],
  },
  {
    icon: Wand2,
    title: 'Generators & Utilities',
    color: 'from-indigo-500 to-purple-500',
    desc: 'One-click generators for common developer needs: UUID batches, human-readable timestamps, and cryptographic hashes — all computed locally.',
    tools: ['UUID Generator', 'Timestamp Converter', 'SHA-256 Hash', 'SHA-1 Hash','Diff Checker','JSON Tree Viewer','Cron Job Builder'],
  },
]

const FAQ = [
  {
    q: 'Is Code Formatter Pro really free?',
    a: 'Yes. Every one of the 40+ tools on Code Formatter Pro is completely free, with no usage limits, no signup, no watermark and no premium tier. The site is community-supported through unobtrusive Google AdSense placements, and you can decline those with a single click on the cookie banner without losing any functionality.',
  },
  {
    q: 'Is my data safe? Where does my JSON / XML / code get sent?',
    a: 'Nowhere. Every formatter, converter, minifier, encoder and generator on Code Formatter Pro runs entirely inside your web browser using client-side JavaScript. Your input is processed on your own computer, is never uploaded to any server, and is never logged or stored by us. This means Code Formatter Pro is safe to use for confidential API responses, database dumps, JWT tokens with secrets, and any other data you would not want to paste into a random online tool.',
  },
  {
    q: 'How do I convert XML to JSON?',
    a: 'Open the sidebar and pick "XML to JSON" from the Converters category. Paste your XML into the left panel or upload a file, and Code Formatter Pro will produce structured JSON in the right panel instantly. Attributes are preserved with an "@_" prefix so no information is lost during the conversion. You can then copy or download the JSON output with a single click.',
  },
  {
    q: 'Which JSON syntax is supported?',
    a: 'Code Formatter Pro validates and formats all standard JSON (RFC 8259). It supports nested objects and arrays of arbitrary depth, all primitive types (string, number, boolean, null), Unicode strings, and both compact and pretty-printed forms. If your input is invalid, the tool shows a helpful error message with the position of the syntax problem so you can fix it quickly.',
  },
  {
    q: 'Can I use Code Formatter Pro offline?',
    a: 'Yes. Once the page has loaded once, all tools continue to work offline because processing happens entirely in your browser. You can also install Code Formatter Pro as a standalone application in Chrome or Edge (via the browser menu, "Install this site as an app") so it opens without a browser bar and appears alongside your other applications.',
  },
  {
    q: 'What is the Diff Checker useful for?',
    a: 'The Diff Checker compares two blocks of text and highlights every difference: additions in green, deletions in red with strike-through, and even invisible characters like trailing spaces (shown as a middle dot) and tabs (shown as an arrow). It supports line-level and word-level modes, can ignore case or leading and trailing whitespace, and is perfect for spotting subtle changes between API responses, config file versions or code snippets.',
  },
  {
    q: 'Why should I minify my code?',
    a: 'Minified JavaScript, CSS, HTML, XML and JSON is smaller and therefore loads faster over the network. On average you save 20 to 40 percent of the file size just by removing whitespace and comments. Smaller files improve page load time, reduce bandwidth costs, and directly improve Core Web Vitals metrics like Largest Contentful Paint (LCP), which are used by Google to rank pages in search results.',
  },
  {
    q: 'Does Code Formatter Pro support large files?',
    a: 'Yes. Because processing is client-side, the only limit is how much memory your browser has. Files of several megabytes are handled without any noticeable delay on a modern laptop. For gigabyte-scale data you may want to run a native tool instead, but for the vast majority of real-world API responses, config files and code snippets Code Formatter Pro is more than fast enough.',
  },
  {
    q: 'Which browsers are supported?',
    a: 'Every modern evergreen browser: Chrome, Firefox, Safari, Edge, Brave, Opera, and Chromium-based browsers on desktop, tablet and phone. Internet Explorer is not supported. The site is fully responsive so it works equally well on a 27 inch monitor and a phone screen.',
  },
  {
    q: 'Can I share a formatted result with a colleague?',
    a: 'Yes. Every tool has a "Share" button that generates a URL containing the tool ID and your input encoded as URL-safe Base64. When your colleague opens the link the same tool loads with the same input already filled in, so they see exactly what you saw. This is great for asking for code review or debugging help.',
  },
]

const SeoContent = () => {
  return (
    <>
      {/* Tool categories with rich descriptions */}
      <section id="categories" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" /> 37+ specialised developer tools
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              One home for every code and data format you use
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Code Formatter Pro groups its tools into six clear categories so you always know where to look. Every tool
              works instantly, respects your privacy, and produces syntax-highlighted output you can copy or download
              with a single click.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map(({ icon: Icon, title, color, desc, tools }) => (
              <article key={title} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{desc}</p>
                <ul className="mt-4 space-y-1">
                  {tools.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Code Formatter Pro — long-form content */}
      <section id="why" className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center">
            Why developers choose Code Formatter Pro
          </h2>

          <div className="mt-10 space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" /> Your data never leaves the tab
              </h3>
              <p className="mt-2">
                Most online formatters send your JSON, XML or code to their servers to process it. That is fine for
                public data, but it is a real problem for anything sensitive: internal API responses, database dumps,
                JWT tokens, or code from a client project you signed an NDA for. Code Formatter Pro takes a different
                approach — everything is done with client-side JavaScript inside your browser. There is no request
                to any backend, no logging, and no way for us or anyone else to see what you formatted. You can
                confirm this by opening your browser DevTools while using any tool: you will not see a single network
                request.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" /> Instant, keystroke-level results
              </h3>
              <p className="mt-2">
                Because there is no server round-trip, every formatter and converter runs as fast as your CPU can
                parse the input. Every tool auto-runs with a short debounce as you type or paste, so you see the
                result before your finger leaves the keyboard. For heavier inputs, click the explicit "Run" button
                to control when the work happens. Output panels use syntax highlighting powered by highlight.js so
                keys, strings, numbers and tags are colour-coded for easy scanning.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Built for real developer workflows
              </h3>
              <p className="mt-2">
                Load a sample with one click when you just want to see how a tool works. Upload a file when your
                input is too large to paste. Download the output as a properly-named file. Copy the result from
                either the top or the bottom of the output panel (whichever your mouse is nearer). Share a
                formatted snippet with a colleague through a URL that reopens the exact tool and input. Pin the
                tools you use every day to the top of the sidebar. Recover your last eight conversions from the
                history panel. These are the small quality-of-life touches that add up to a tool you actually enjoy
                using.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-violet-500" /> Every popular conversion, all in one place
              </h3>
              <p className="mt-2">
                Modern APIs speak JSON. Enterprise systems speak XML. DevOps configs speak YAML. Data teams speak
                CSV. Sooner or later every developer needs to move between them. Code Formatter Pro includes every
                popular pairing: XML to JSON, JSON to XML, YAML to JSON, JSON to YAML, CSV to JSON, JSON to CSV,
                and even cross-format shortcuts like XML to YAML or YAML to XML. Type information is preserved
                where possible, and structure is faithfully mapped so nested arrays and objects come through
                intact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-center text-slate-600 dark:text-slate-300">
            Everything you might wonder before pasting your first snippet.
          </p>

          <div className="mt-10 space-y-4">
            {FAQ.map((item, i) => (
              <details key={i} className="group rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-3 list-none">
                  <span>{item.q}</span>
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-sm group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-slate-700 dark:text-slate-300 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default SeoContent
