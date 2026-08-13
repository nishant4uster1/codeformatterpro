# Code Formatter Pro — PRD

## Original Problem Statement
Rebrand the CodeFormatter repo: update website name/hostname from `codeformatter.online` to
`codeformatterpro.com`, and ensure search engines surface SEO wording like "Free Online tool...".

## App Overview
Next.js (App Router) client-side developer toolkit: 37+ formatters/converters/validators
(JSON, XML, YAML, CSV, HTML, CSS, JS, SQL, Base64, JWT, Diff, JSON Tree, hashes, etc.).
All processing runs in the browser. Deployed on Netlify.

## Work Done (2026-06)
- Domain rebrand: `codeformatter.online` → `codeformatterpro.com` in `app/layout.js`,
  `app/sitemap.js`, `app/robots.js` (fallback defaults). Also `.env.example` `NEXT_PUBLIC_BASE_URL`.
- Brand display name: `CodeFormatter` → `Code Formatter Pro` across all user-facing text,
  metadata, JSON-LD structured data, FAQ, Open Graph/Twitter, README, blog, privacy/cookies pages.
  Code identifier `CodeFormatterApp` (component/import/paths) left untouched.
- SEO copy (user-approved):
  - Title: "Code Formatter Pro — Free Online JSON, XML, YAML, CSV, HTML, CSS, JS Formatter & Converter"
  - Description: "Code Formatter Pro is a free online tool to format, minify, validate and convert
    JSON, XML, YAML, CSV, HTML, CSS, JavaScript, SQL, Base64 and JWT — 37+ developer tools that run
    privately in your browser."
- Verified with `next build` (17/17 pages) + live curl: title, meta description, canonical,
  og:url/og:site_name, robots.txt host+sitemap, sitemap.xml, and JSON-LD all reflect the new
  domain/brand.

## Notes
- Set `NEXT_PUBLIC_BASE_URL=https://codeformatterpro.com` in the production (Netlify) env for
  canonical/sitemap/robots to resolve correctly.
- Google verification file `googlea938ed80848e88f2.html` left as-is (may need re-verification for the new domain in Search Console).

## Backlog / Next
- P1: Add a proper OG/Twitter share image at the new domain.
- P2: Update Google Search Console property to codeformatterpro.com and submit new sitemap.

## Work Done (2026-06) — Cloudflare deploy fix + Contact page
- **Cloudflare "Hello World" bug fixed**: Root cause was the app being configured for
  Netlify SSR (`output: 'standalone'`) plus an unused MongoDB API catch-all
  (`app/api/[[...path]]/route.js`) that returned `{message:"Hello World"}`. On Cloudflare
  Pages this served a fallback Worker instead of the site.
  Fix: switched `next.config.js` to `output: 'export'` (static HTML export, best fit since
  every tool runs client-side), `images.unoptimized: true`, deleted `app/api`, added
  `export const dynamic = 'force-static'` to `sitemap.js` + `robots.js`, and added
  `public/_headers` (security headers for Cloudflare Pages). `yarn build` now emits an
  `out/` folder with 18 pre-rendered pages.
- **Cloudflare Pages build settings**: Build command `npx next build` (or `yarn build`),
  Output directory `out`. Set env `NEXT_PUBLIC_BASE_URL=https://<your-domain>` in Pages.
- **Contact page** `/contact` (SEO-friendly dedicated route with metadata + ContactPage
  JSON-LD, added to sitemap). WhatsApp form (`components/ContactForm.js`): Category dropdown
  (Suggestion / Complaint / Others) + detailed message textarea; on submit opens
  `https://wa.me/919643876061` with `*Code Formatter Pro — <Category>*` + message pre-filled
  (falls back to location.href if popup blocked). Footer "Contact" link now points to `/contact`.
- Verified: testing agent 7/7 frontend scenarios PASS (static-export regression + contact flow).

## Work Done (2026-06) — Contact fields + XML NETCONF marker fix
- Contact form: added **Name** and **Your phone number** fields (with phone-format validation:
  7–15 digits, optional +) alongside Category + Detailed message; all included in the
  pre-filled WhatsApp message. Verified 100% (iteration_2, iteration_3).
- **XML Formatter/Minifier `]]>]]>` fix** (`lib/formatters.js`): NETCONF/BEEP streams contain
  multiple XML documents separated by the `]]>]]>` end marker. The formatter now splits on
  this marker (`splitXmlBlocks`), formats each block independently, tolerates "multiple
  possible root nodes" (via a throwaway `<__cfp_wrap__>` wrap/unwrap), and re-emits `]]>]]> `
  (marker + trailing space) after each block. `xmlToJson` returns a JSON array for multi-block
  input. Genuinely invalid XML still errors. Verified 100% end-to-end (iteration_4).


