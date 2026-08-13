# Code Formatter Pro

A free, all-in-one online toolkit to **format, minify, validate and convert** every popular data & code format — JSON, XML, YAML, CSV, HTML, CSS, JavaScript, SQL, Base64, JWT and more. Everything runs privately in your browser.

Built by [NeoWebSolutions](https://neowebsolutions.netlify.app/).

## ✨ Features

- **Formatters / Beautifiers** — JSON, XML, HTML, CSS, JavaScript, SQL, YAML
- **Minifiers** — JSON, XML, HTML, CSS, JavaScript
- **Converters** — JSON ↔ XML, JSON ↔ YAML, JSON ↔ CSV, XML ↔ YAML
- **Encoders / Decoders** — Base64, URL, HTML entities, JWT
- **Text Tools** — case converters, reverse, whitespace remover, word/char counter
- **Generators** — UUID, timestamp converter, SHA-256, SHA-1
- **Viewers & Utilities** — Diff Checker (highlights trailing spaces & tabs), JSON Tree Viewer
- **Quality-of-life extras** — dark/light theme, file upload, downloadable output, syntax highlighting, URL sharing, recent history, favorites pin
- **Monetisation-ready** — pre-wired Google AdSense slots with a GDPR-compliant cookie consent banner and full Privacy / Cookie policy pages

## 🚀 Run locally

**Requirements:** Node.js 18+ and either `yarn` or `npm`.

```bash
# 1. Install dependencies
yarn install          # or:  npm install

# 2. Copy the env template
cp .env.example .env

# 3. Start the dev server
yarn dev              # or:  npm run dev

# open http://localhost:3000
```

### Production build

```bash
yarn build && yarn start        # or:  npm run build && npm start
```

## ⚙️ Environment variables

Everything the app cares about lives in a single `.env` file at the project root:

```env
# Required scaffolding (leave as-is if you don't use MongoDB — no tool queries it)
MONGO_URL=mongodb://localhost:27017/codeformatter
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google AdSense (optional — leave blank to hide ads and show dev-only placeholders)
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT_HERO=
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=
NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT=
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=
```

## 💰 Setting up Google AdSense

The site ships with **four responsive ad slots** in the same positions used by popular formatters such as `jsonformatter.org`:

| Slot key | Where it appears | Suggested ad size in AdSense |
|---|---|---|
| `HERO` | Top banner right below the hero, above the workspace | *Display · Horizontal / Responsive* |
| `SIDEBAR` | Below the tool list on the left side | *Display · Rectangle 300×250 or Responsive* |
| `INCONTENT` | Between the workspace and the About section | *In-article · Responsive* |
| `FOOTER` | Bottom banner just above the footer | *Display · Horizontal / Responsive* |

### Step-by-step

1. **Create a Google AdSense account** at <https://www.google.com/adsense/> and add this domain.
2. Once your site is **approved**, Google will give you a **Publisher ID** that looks like `ca-pub-1234567890123456`. Copy it into `.env` as `NEXT_PUBLIC_ADSENSE_CLIENT`.
3. In the AdSense dashboard, go to **Ads → By ad unit → Create new ad unit → Display ads**.
4. For each of the four slots (`HERO`, `SIDEBAR`, `INCONTENT`, `FOOTER`) create one ad unit. Google will show you a snippet that contains something like:
   ```html
   <ins ... data-ad-client="ca-pub-1234..." data-ad-slot="9876543210" ...></ins>
   ```
   Copy the **10-digit slot ID** (`9876543210` in this example) and paste it into the matching `NEXT_PUBLIC_ADSENSE_SLOT_*` variable in `.env`.
5. Restart the dev server (`yarn dev`) — the placeholder tiles will be replaced with real Google ads **as soon as a visitor accepts the cookie banner**.

### Where do I change ad code myself?

You almost never need to touch code — everything is env-driven. The files are:

| File | What lives here |
|---|---|
| `.env` | Your publisher ID and 4 slot IDs |
| `lib/ads.js` | Reads env vars, exports `ADSENSE_CLIENT` + `AD_SLOTS`. Only edit if you want to **add** a brand-new slot key. |
| `components/AdSlot.js` | Reusable `<AdSlot slot="hero" />` component (also renders the dev placeholder). Change wrapper styling / label here. |
| `components/CookieConsent.js` | GDPR banner. Injects the AdSense loader `<script>` **only after** the user clicks *Accept*. |
| `app/layout.js` | Adds the `<meta name="google-adsense-account">` verification tag automatically when `NEXT_PUBLIC_ADSENSE_CLIENT` is set. |
| `components/CodeFormatterApp.js` | Where each `<AdSlot />` is physically placed on the page. Move / duplicate the tags here to change ad positions. |

### GDPR / consent behaviour

- The AdSense loader script is **not** added to the page until the visitor clicks **Accept all** in the cookie banner.
- If they click **Reject non-essential**, no ad code is loaded and no ad cookies are set.
- The consent choice is stored in `localStorage.cf-consent` and can be reset any time from the [**Cookie Policy**](./app/cookies/page.js) page.

## 🔒 Privacy & compliance

Two policy pages are bundled and linked from the footer of every page:

- `/privacy` — [Privacy Policy](./app/privacy/page.js)
- `/cookies` — [Cookie Policy](./app/cookies/page.js), including a self-service "reset consent" button

Both are pre-filled for the NeoWebSolutions / Code Formatter Pro deployment; if you rebrand, edit the text inside those two files.

## 📂 Project layout

```
app/
├── app/
│   ├── api/[[...path]]/route.js   # Next.js API catch-all (unused by tools)
│   ├── privacy/page.js            # Privacy Policy
│   ├── cookies/page.js            # Cookie Policy
│   ├── globals.css                # Tailwind + custom highlight.js theme
│   ├── layout.js                  # Root layout + AdSense meta
│   ├── page.js                    # Client-only dynamic import wrapper
│   └── providers.js
├── components/
│   ├── CodeFormatterApp.js        # Main workspace UI (rendered client-only)
│   ├── DiffChecker.js             # Diff tool
│   ├── JsonTree.js                # Collapsible JSON tree
│   ├── AdSlot.js                  # Reusable AdSense slot
│   ├── CookieConsent.js           # Consent banner + AdSense loader
│   └── ui/                        # shadcn components
├── lib/
│   ├── formatters.js              # All conversion / formatting functions
│   ├── tools.js                   # Tool registry
│   ├── ads.js                     # AdSense config (env-driven)
│   └── utils.js
├── tailwind.config.js
├── package.json
├── .env.example
└── README.md
```

## 🛠 Adding a new tool

1. Add a function to `lib/formatters.js` (e.g. `export const myTool = (input) => …`).
2. Register it in `lib/tools.js` with `id`, `name`, `category`, `desc`, `run`, `sample`, and language hints (`inLang`, `outLang`, `ext`).
3. That's it — the sidebar, workspace and favorites system pick it up automatically.

## 📄 License

MIT.

---

Website built with ❤ by [NeoWebSolutions](https://neowebsolutions.netlify.app/).
