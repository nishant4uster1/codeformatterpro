// Blog article registry — used by /blog page and /blog/[slug] detail pages.
// Each article is a short, informative primer about a data / code format supported by Code Formatter Pro.

export const BLOG_POSTS = [
  {
    slug: 'what-is-json',
    title: 'What is JSON? A quick primer for developers',
    excerpt:
      'JSON (JavaScript Object Notation) is the lingua franca of the modern web. Learn its rules, common pitfalls and when to use it.',
    tags: ['JSON', 'Data formats', 'API'],
    readingTime: '4 min read',
    date: '2025-06-15',
    content: [
      {
        h: 'What JSON actually is',
        p: 'JSON (JavaScript Object Notation) is a lightweight, text-based data-interchange format. It represents structured data as a mix of objects (key\u2013value pairs wrapped in curly braces), arrays (ordered lists wrapped in square brackets), strings, numbers, booleans and the value null. Despite its name, JSON is completely language-independent \u2014 nearly every programming language ships with a JSON parser out of the box.',
      },
      {
        h: 'Where you will meet it',
        p: 'JSON is the default payload format for REST and GraphQL APIs, the storage format for many NoSQL databases (MongoDB, Firestore), and the go-to config format for tools such as npm, VS Code and TypeScript.',
      },
      {
        h: 'Common gotchas',
        p: 'Keys must be double-quoted. Trailing commas are not allowed. Comments are not part of the spec. Numbers must be finite (no NaN or Infinity). Fix these three things and 90% of "invalid JSON" errors disappear.',
      },
      {
        h: 'Try it right now',
        p: 'Use our JSON Formatter to prettify or validate any snippet, our JSON Minifier to shrink it for production, or the JSON Tree Viewer to explore deep API responses interactively.',
      },
    ],
    related: ['what-is-xml', 'what-is-yaml', 'what-is-csv'],
  },
  {
    slug: 'what-is-xml',
    title: 'XML explained: still relevant, still everywhere',
    excerpt:
      'XML is older than JSON but still runs enterprise systems, config files and document formats. Here is what you need to know.',
    tags: ['XML', 'Data formats'],
    readingTime: '4 min read',
    date: '2025-06-16',
    content: [
      {
        h: 'What XML is',
        p: 'XML (eXtensible Markup Language) is a self-describing, tag-based text format designed for storing and transporting data. Every value lives inside a named element, and every element can have attributes, child elements and text content. Unlike HTML, XML has no built-in tags \u2014 you invent the vocabulary that fits your data.',
      },
      {
        h: 'Where it lives today',
        p: 'XML powers SOAP web services, legacy enterprise integrations, Office documents (docx, xlsx are ZIPped XML), Android manifests, RSS feeds, SVG images and countless configuration files.',
      },
      {
        h: 'Well-formed vs valid',
        p: 'An XML document is well-formed when every start tag has a matching end tag and elements are properly nested. It is valid when it also conforms to a schema (XSD or DTD). Our XML Formatter checks well-formedness and highlights mismatched tags so you can catch broken markup instantly.',
      },
      {
        h: 'Convert freely',
        p: 'Need XML as JSON or YAML? Use the XML to JSON and XML to YAML converters \u2014 attributes are preserved with an @_ prefix so no information is lost.',
      },
    ],
    related: ['what-is-json', 'what-is-yaml', 'what-is-csv'],
  },
  {
    slug: 'what-is-yaml',
    title: 'YAML: the config format DevOps fell in love with',
    excerpt:
      'YAML is a human-friendly superset of JSON that dominates CI/CD, Kubernetes and cloud configuration. Learn its rules and traps.',
    tags: ['YAML', 'DevOps', 'Config'],
    readingTime: '3 min read',
    date: '2025-06-17',
    content: [
      {
        h: 'What YAML is',
        p: 'YAML (YAML Ain\u2019t Markup Language) is a whitespace-sensitive, human-readable data serialisation format. It maps cleanly to the same object / array / scalar model as JSON, but drops braces and quotes in favour of indentation, making it much easier for humans to read and edit.',
      },
      {
        h: 'Where it rules',
        p: 'GitHub Actions workflows, Kubernetes manifests, Docker Compose files, Ansible playbooks, Netlify config, OpenAPI specs \u2014 all of them speak YAML.',
      },
      {
        h: 'Traps to avoid',
        p: 'Indentation must use spaces, never tabs. "yes", "no", "on", "off" resolve to booleans (this famously bit the Norway country code "NO"). Always quote values that might be misread. Our YAML Formatter surfaces syntax problems before they break your pipeline.',
      },
      {
        h: 'Convert to JSON in one click',
        p: 'YAML to JSON and JSON to YAML converters handle nested arrays, anchors and multi-line strings.',
      },
    ],
    related: ['what-is-json', 'what-is-xml', 'what-is-csv'],
  },
  {
    slug: 'what-is-csv',
    title: 'CSV done right: quoting, delimiters and Excel quirks',
    excerpt:
      'CSV looks trivial until a value contains a comma or a newline. Here is how the format really works.',
    tags: ['CSV', 'Data formats'],
    readingTime: '3 min read',
    date: '2025-06-18',
    content: [
      {
        h: 'The rules that everyone forgets',
        p: 'CSV (Comma-Separated Values) stores tabular data as plain text: one row per line, cells separated by a delimiter. When a cell contains the delimiter, a quote or a line break, it must be wrapped in double quotes, with any internal quotes doubled up. Follow those rules and every parser on Earth will read your file correctly.',
      },
      {
        h: 'Why the delimiter matters',
        p: 'Comma is standard, but European locales often use semicolon (because comma is the decimal separator) and data pipelines frequently use tab-separated values (TSV). Our CSV to JSON converter lets you pick the delimiter explicitly \u2014 comma, semicolon or tab \u2014 so imports from Excel, Google Sheets and warehouse exports Just Work.',
      },
      {
        h: 'From CSV to JSON and back',
        p: 'Once your CSV parses cleanly, jump to JSON to CSV to flatten a nested API response, or use the JSON Tree Viewer to explore the intermediate structure.',
      },
    ],
    related: ['what-is-json', 'what-is-xml', 'what-is-yaml'],
  },
  {
    slug: 'what-is-base64',
    title: 'Base64 in 3 minutes: what it is (and is not)',
    excerpt:
      'Base64 is everywhere \u2014 in JWT tokens, data URLs and email attachments. It is NOT encryption. Here is the truth.',
    tags: ['Base64', 'Encoding'],
    readingTime: '3 min read',
    date: '2025-06-19',
    content: [
      {
        h: 'What Base64 is',
        p: 'Base64 is a binary-to-text encoding scheme that represents 8-bit bytes using a 64-character alphabet (A\u2013Z, a\u2013z, 0\u20139, + and /). The result is always plain ASCII, making it safe to embed inside JSON, XML, email, HTTP headers or URLs (with the URL-safe variant that swaps + and / for - and _).',
      },
      {
        h: 'What Base64 is not',
        p: 'Base64 is not encryption. Anyone can decode a Base64 string in a fraction of a second. Never use it to hide secrets \u2014 use real cryptography for that.',
      },
      {
        h: 'Where you meet it every day',
        p: 'JWT payloads and headers, inline images (data:image/png;base64,\u2026), PDF and email MIME attachments, cryptographic keys in PEM format, and OAuth Basic authentication headers all rely on Base64.',
      },
      {
        h: 'Encode and decode instantly',
        p: 'Use the Base64 Encode and Base64 Decode tools \u2014 everything runs locally in your browser, so it is safe to paste sensitive tokens.',
      },
    ],
    related: ['what-is-jwt', 'what-is-json'],
  },
  {
    slug: 'what-is-jwt',
    title: 'JWT anatomy: what lives inside a token',
    excerpt:
      'JWTs are short strings with three dots. Learn what each segment holds and why signing matters.',
    tags: ['JWT', 'Security', 'Auth'],
    readingTime: '4 min read',
    date: '2025-06-20',
    content: [
      {
        h: 'The three-part shape',
        p: 'A JSON Web Token (JWT) is three Base64URL-encoded segments joined by dots: header.payload.signature. The header declares the signing algorithm, the payload holds the claims (subject, expiry, custom fields), and the signature proves the token was issued by a trusted party.',
      },
      {
        h: 'Encoded, not encrypted',
        p: 'Anyone can decode the header and payload of a JWT \u2014 that is exactly what our JWT Decoder does. The signature is what stops attackers from tampering with the claims, because verifying it requires the server\u2019s secret or public key.',
      },
      {
        h: 'Best-practice checklist',
        p: 'Always set a short expiry (exp). Prefer asymmetric algorithms (RS256, EdDSA) for public APIs. Rotate signing keys. Never accept a token with alg: none.',
      },
      {
        h: 'Inspect a token now',
        p: 'Paste any JWT into the JWT Decoder to see the header and payload side by side \u2014 processing happens locally, so even production tokens stay private.',
      },
    ],
    related: ['what-is-base64', 'what-is-json'],
  },
  {
    slug: 'what-is-sql-formatting',
    title: 'Why you should format your SQL (and how)',
    excerpt:
      'Nicely formatted SQL is easier to review, easier to debug and easier to optimise. Here is the playbook.',
    tags: ['SQL', 'Formatting'],
    readingTime: '3 min read',
    date: '2025-06-21',
    content: [
      {
        h: 'The case for consistent SQL',
        p: 'Compressed SQL that fits on one line is fine for a machine but brutal for humans. Uppercasing keywords, breaking after each clause and indenting subqueries makes long queries scannable in seconds and catches subtle bugs (missing joins, unfiltered updates) that hide in dense text.',
      },
      {
        h: 'What our formatter does',
        p: 'The SQL Formatter uses sql-formatter under the hood with keyword case set to upper and a two-space indent. It handles PostgreSQL, MySQL, SQL Server, BigQuery, SQLite and Redshift dialects, and it preserves your comments so review notes survive.',
      },
      {
        h: 'Pair it with the Diff Checker',
        p: 'Format two versions of a query and drop them into the Diff Checker to see exactly what changed \u2014 including whitespace \u2014 before you ship a migration.',
      },
    ],
    related: ['what-is-json', 'what-is-yaml'],
  },
  {
    slug: 'what-is-html-css-js-formatting',
    title: 'HTML, CSS and JavaScript beautification: a quick tour',
    excerpt:
      'Format the three front-end languages consistently so code review focuses on logic, not indentation.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    readingTime: '3 min read',
    date: '2025-06-22',
    content: [
      {
        h: 'One toolbelt, three languages',
        p: 'Code Formatter Pro\u2019s HTML, CSS and JavaScript formatters are all powered by js-beautify, a battle-tested library used by editors like Sublime Text and VS Code plugins. That means the output matches what most linters and Prettier configurations expect.',
      },
      {
        h: 'When to format',
        p: 'Before committing a hand-written snippet, before pasting into a bug report, and before minifying for production. Formatted source diffs are dramatically smaller and easier to review.',
      },
      {
        h: 'Minify when you ship',
        p: 'Once you are happy with the source, run the same file through the matching Minifier to strip comments and whitespace \u2014 typically a 20\u201340% file-size win, which directly improves Largest Contentful Paint (LCP).',
      },
    ],
    related: ['what-is-json', 'what-is-sql-formatting'],
  },
]

export const getPostBySlug = (slug) => BLOG_POSTS.find((p) => p.slug === slug)
