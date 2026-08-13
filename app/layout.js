import './globals.css'
import { Providers } from './providers'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://codeformatterpro.com'
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''

// Rich metadata aligned with Google Search Central's SEO starter guide
// (https://developers.google.com/search/docs/fundamentals/seo-starter-guide):
// unique title / description, meaningful keywords, robots directives,
// language + Open Graph + Twitter cards + JSON-LD structured data.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Code Formatter Pro — Free Online JSON, XML, YAML, CSV, HTML, CSS, JS Formatter & Converter',
    template: '%s · Code Formatter Pro',
  },
  description:
    'Code Formatter Pro is a free online tool to format, minify, validate and convert JSON, XML, YAML, CSV, HTML, CSS, JavaScript, SQL, Base64 and JWT — 40+ developer tools that run privately in your browser.',
  keywords: [
    'json formatter', 'json beautifier', 'json validator', 'json minifier',
    'xml formatter', 'xml to json', 'json to xml', 'yaml to json', 'json to yaml',
    'csv to json', 'json to csv', 'html formatter', 'css formatter', 'javascript formatter',
    'sql formatter', 'base64 encoder', 'base64 decoder', 'url encoder', 'jwt decoder',
    'diff checker', 'json tree viewer', 'developer tools', 'code beautifier', 'online formatter',
  ],
  authors: [{ name: 'NeoWebSolutions', url: 'https://neowebsolutions.netlify.app/' }],
  creator: 'NeoWebSolutions',
  publisher: 'NeoWebSolutions',
  applicationName: 'Code Formatter Pro',
  category: 'Developer Tools',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Code Formatter Pro',
    title: 'Code Formatter Pro — Free Online JSON, XML, YAML, CSV, HTML, CSS, JS Formatter & Converter',
    description:
      '40+ free developer tools to format, minify, validate and convert JSON, XML, YAML, CSV, HTML, CSS, JavaScript, SQL, Base64 and JWT. Runs entirely in your browser.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Code Formatter Pro — Free Online JSON, XML, YAML, CSV, HTML, CSS, JS Formatter & Converter',
    description:
      '40+ free developer tools to format, minify, validate and convert data & code. Runs entirely in your browser.',
    creator: '@neowebsolutions',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// JSON-LD structured data — improves rich results in Google Search
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      name: 'Code Formatter Pro',
      url: SITE_URL,
      description:
        'A free suite of 40+ developer tools to format, minify, validate and convert JSON, XML, YAML, CSV, HTML, CSS, JavaScript, SQL, Base64 and JWT — plus a Diff Checker and JSON Tree Viewer.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: {
        '@type': 'Organization',
        name: 'NeoWebSolutions',
        url: 'https://neowebsolutions.netlify.app/',
      },
      featureList: [
        'JSON Formatter and Validator',
        'XML to JSON Converter',
        'JSON to XML Converter',
        'YAML to JSON Converter',
        'CSV to JSON Converter',
        'HTML / CSS / JavaScript Beautifier',
        'SQL Formatter',
        'Base64 Encoder and Decoder',
        'JWT Decoder',
        'URL Encoder',
        'Diff Checker',
        'JSON Tree Viewer',
        'UUID Generator',
        'SHA-256 / SHA-1 Hash Generator',
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'NeoWebSolutions',
      url: 'https://neowebsolutions.netlify.app/',
      logo: `${SITE_URL}/favicon.svg`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Code Formatter Pro',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/#tools` },
        { '@type': 'ListItem', position: 3, name: 'Blog', item: `${SITE_URL}/blog` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is Code Formatter Pro free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every tool on Code Formatter Pro is 100% free. No signup, no watermark, no rate limits.' } },
        { '@type': 'Question', name: 'Is my data safe on Code Formatter Pro?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. All formatting, minifying, validation and conversion happens locally inside your web browser. Your data never touches our servers.' } },
        { '@type': 'Question', name: 'Can I convert XML to JSON?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Open the XML to JSON converter, paste your XML on the left, and copy the JSON output on the right.' } },
        { '@type': 'Question', name: 'Does Code Formatter Pro work offline?', acceptedAnswer: { '@type': 'Answer', text: 'Once the page has loaded, every tool works completely offline because the processing is client-side.' } },
      ],
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {ADSENSE_CLIENT && <meta name="google-adsense-account" content={ADSENSE_CLIENT} />}
        <link rel="canonical" href={SITE_URL} />
        <link rel="alternate" hrefLang="en" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* Boot-time theme flash guard: reads the persisted preference from
            localStorage before React hydrates so the correct light/dark class
            is applied on <html> immediately. Runs synchronously by design. */}
        <script dangerouslySetInnerHTML={{__html: `try{var t=localStorage.getItem('cf-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}`}} />
      </head>
      <body suppressHydrationWarning className="text-[17px] leading-relaxed antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <a href="#tools" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded focus:shadow">
          Skip to tools
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
