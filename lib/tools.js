import * as F from './formatters'

// Tool registry. Each tool defines category, inputs/output labels, sample, run function, and
// input/output language hints for syntax highlighting.
export const TOOLS = [
  // Formatters
  { id: 'json-format', name: 'JSON Formatter / Beautifier', category: 'Formatters', desc: 'Prettify and validate JSON with proper indentation.', inLang: 'json', outLang: 'json', ext: 'json', run: (i) => F.formatJSON(i), sample: '{"name":"Ada","skills":["math","logic"],"age":36}' },
  { id: 'xml-format', name: 'XML Formatter', category: 'Formatters', desc: 'Beautify and indent XML documents.', inLang: 'xml', outLang: 'xml', ext: 'xml', run: (i, opts) => F.formatXML(i, opts), sample: '<root><user id="1"><name>Ada</name></user></root>' },
  { id: 'html-format', name: 'HTML Formatter', category: 'Formatters', desc: 'Clean up and indent HTML markup.', inLang: 'xml', outLang: 'xml', ext: 'html', run: (i) => F.formatHTML(i), sample: '<div><h1>Hello</h1><p>World</p></div>' },
  { id: 'css-format', name: 'CSS Formatter', category: 'Formatters', desc: 'Beautify CSS rules with consistent indentation.', inLang: 'css', outLang: 'css', ext: 'css', run: (i) => F.formatCSS(i), sample: 'body{margin:0;padding:0;color:red}a{color:blue}' },
  { id: 'js-format', name: 'JavaScript Formatter', category: 'Formatters', desc: 'Prettify JavaScript source code.', inLang: 'javascript', outLang: 'javascript', ext: 'js', run: (i) => F.formatJS(i), sample: 'function hi(name){return "Hello "+name;}console.log(hi("Ada"));' },
  { id: 'sql-format', name: 'SQL Formatter', category: 'Formatters', desc: 'Format SQL queries with keyword casing and indent.', inLang: 'sql', outLang: 'sql', ext: 'sql', run: (i) => F.formatSQL(i), sample: 'select id,name from users where active=1 order by name' },
  { id: 'yaml-format', name: 'YAML Formatter', category: 'Formatters', desc: 'Reformat YAML with clean indentation.', inLang: 'yaml', outLang: 'yaml', ext: 'yaml', run: (i) => F.formatYAML(i), sample: 'name: Ada\nage: 36\nskills:\n- math\n- logic' },

  // Minifiers
  { id: 'json-mini', name: 'JSON Minifier', category: 'Minifiers', desc: 'Strip whitespace to produce compact JSON.', inLang: 'json', outLang: 'json', ext: 'json', run: (i) => F.minifyJSON(i), sample: '{\n  "a": 1,\n  "b": [1, 2, 3]\n}' },
  { id: 'xml-mini', name: 'XML Minifier', category: 'Minifiers', desc: 'Compress XML by removing unnecessary whitespace.', inLang: 'xml', outLang: 'xml', ext: 'xml', run: (i, opts) => F.minifyXML(i, opts), sample: '<root>\n  <a>1</a>\n  <b>2</b>\n</root>' },
  { id: 'html-mini', name: 'HTML Minifier', category: 'Minifiers', desc: 'Remove comments and collapse whitespace in HTML.', inLang: 'xml', outLang: 'xml', ext: 'html', run: (i) => F.minifyHTML(i), sample: '<div>\n  <!-- hi -->\n  <p>Hello</p>\n</div>' },
  { id: 'css-mini', name: 'CSS Minifier', category: 'Minifiers', desc: 'Produce compact CSS for production.', inLang: 'css', outLang: 'css', ext: 'css', run: (i) => F.minifyCSS(i), sample: '/* main */\nbody {\n  margin: 0;\n  padding: 0;\n}' },
  { id: 'js-mini', name: 'JavaScript Minifier', category: 'Minifiers', desc: 'Basic JavaScript minification.', inLang: 'javascript', outLang: 'javascript', ext: 'js', run: (i) => F.minifyJS(i), sample: '// greet\nfunction hi (name) {\n  return "Hi " + name;\n}' },

  // Converters
  { id: 'json-to-xml', name: 'JSON to XML', category: 'Converters', desc: 'Convert JSON objects into XML.', inLang: 'json', outLang: 'xml', ext: 'xml', run: (i) => F.jsonToXml(i), sample: '{"user":{"name":"Ada","age":36}}' },
  { id: 'xml-to-json', name: 'XML to JSON', category: 'Converters', desc: 'Convert XML documents into JSON.', inLang: 'xml', outLang: 'json', ext: 'json', run: (i) => F.xmlToJson(i), sample: '<user><name>Ada</name><age>36</age></user>' },
  { id: 'json-to-yaml', name: 'JSON to YAML', category: 'Converters', desc: 'Convert JSON to YAML format.', inLang: 'json', outLang: 'yaml', ext: 'yaml', run: (i) => F.jsonToYaml(i), sample: '{"name":"Ada","skills":["math","logic"]}' },
  { id: 'yaml-to-json', name: 'YAML to JSON', category: 'Converters', desc: 'Convert YAML into JSON.', inLang: 'yaml', outLang: 'json', ext: 'json', run: (i) => F.yamlToJson(i), sample: 'name: Ada\nskills:\n  - math\n  - logic' },
  { id: 'json-to-csv', name: 'JSON to CSV', category: 'Converters', desc: 'Convert an array of JSON objects to CSV.', inLang: 'json', outLang: 'plaintext', ext: 'csv', run: (i) => F.jsonToCsv(i), sample: '[{"name":"Ada","age":36},{"name":"Grace","age":42}]' },
  { id: 'csv-to-json', name: 'CSV to JSON', category: 'Converters', desc: 'Convert CSV data into JSON. Supports comma, semicolon and tab delimiters.', inLang: 'plaintext', outLang: 'json', ext: 'json', run: (i, opts) => F.csvToJson(i, (opts && opts.delimiter) || ','), sample: 'name,age\nAda,36\nGrace,42', options: { delimiter: ',' } },
  { id: 'xml-to-yaml', name: 'XML to YAML', category: 'Converters', desc: 'Convert XML into YAML.', inLang: 'xml', outLang: 'yaml', ext: 'yaml', run: (i) => F.jsonToYaml(F.xmlToJson(i)), sample: '<user><name>Ada</name></user>' },
  { id: 'yaml-to-xml', name: 'YAML to XML', category: 'Converters', desc: 'Convert YAML into XML.', inLang: 'yaml', outLang: 'xml', ext: 'xml', run: (i) => F.jsonToXml(F.yamlToJson(i)), sample: 'user:\n  name: Ada' },

  // Encoders / Decoders
  { id: 'base64-enc', name: 'Base64 Encode', category: 'Encoders / Decoders', desc: 'Encode plain text into Base64.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.base64Encode(i), sample: 'Hello, Code Formatter Pro!' },
  { id: 'base64-dec', name: 'Base64 Decode', category: 'Encoders / Decoders', desc: 'Decode Base64 back to plain text.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.base64Decode(i), sample: 'SGVsbG8sIENvZGVGb3JtYXR0ZXIh' },
  { id: 'url-enc', name: 'URL Encode', category: 'Encoders / Decoders', desc: 'Percent-encode a string for URLs.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.urlEncode(i), sample: 'name=Ada Lovelace&role=engineer' },
  { id: 'url-dec', name: 'URL Decode', category: 'Encoders / Decoders', desc: 'Decode percent-encoded URLs.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.urlDecode(i), sample: 'name%3DAda%20Lovelace%26role%3Dengineer' },
  { id: 'html-enc', name: 'HTML Entity Encode', category: 'Encoders / Decoders', desc: 'Escape HTML special characters.', inLang: 'xml', outLang: 'plaintext', ext: 'txt', run: (i) => F.htmlEntityEncode(i), sample: '<div class="hi">Hello & welcome</div>' },
  { id: 'html-dec', name: 'HTML Entity Decode', category: 'Encoders / Decoders', desc: 'Unescape HTML entities to characters.', inLang: 'plaintext', outLang: 'xml', ext: 'html', run: (i) => F.htmlEntityDecode(i), sample: '&lt;div class=&quot;hi&quot;&gt;Hello &amp; welcome&lt;/div&gt;' },
  { id: 'jwt-dec', name: 'JWT Decoder', category: 'Encoders / Decoders', desc: 'Decode a JWT token into header and payload.', inLang: 'plaintext', outLang: 'json', ext: 'json', run: (i) => F.jwtDecode(i), sample: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIn0.abc' },

  // Text tools
  { id: 'txt-upper', name: 'UPPERCASE', category: 'Text Tools', desc: 'Convert text to UPPERCASE.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.toUpper(i), sample: 'hello world' },
  { id: 'txt-lower', name: 'lowercase', category: 'Text Tools', desc: 'Convert text to lowercase.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.toLower(i), sample: 'HELLO WORLD' },
  { id: 'txt-title', name: 'Title Case', category: 'Text Tools', desc: 'Capitalize the first letter of each word.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.toTitle(i), sample: 'hello beautiful world' },
  { id: 'txt-reverse', name: 'Reverse Text', category: 'Text Tools', desc: 'Reverse the order of characters.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.reverseText(i), sample: 'Code Formatter Pro' },
  { id: 'txt-strip', name: 'Remove Whitespace', category: 'Text Tools', desc: 'Remove all whitespace characters from text.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.removeWhitespace(i), sample: 'this   has  \n  extra spaces' },
  { id: 'txt-clean-spaces', name: 'Clean Extra Spaces', category: 'Text Tools', desc: 'Collapse multiple spaces/tabs between words into a single space and trim line ends, while keeping every line break intact.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.cleanSpaces(i), sample: 'Hello     world  \n\n   This    line   has   extra     spaces.\nAnd    another    line.' },
  { id: 'txt-count', name: 'Word / Char Counter', category: 'Text Tools', desc: 'Count characters, words, and lines.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.wordCount(i), sample: 'The quick brown fox jumps over the lazy dog.' },

  // Generators & utilities
  { id: 'gen-uuid', name: 'UUID Generator', category: 'Generators', desc: 'Generate a batch of v4 UUIDs.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: () => F.generateUUIDs(5), sample: '' },
  { id: 'gen-ts', name: 'Timestamp Converter', category: 'Generators', desc: 'Convert Unix timestamps and dates.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: (i) => F.timestampConvert(i), sample: '1717243200' },
  { id: 'gen-sha256', name: 'SHA-256 Hash', category: 'Generators', desc: 'Generate a SHA-256 hash of the input.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: async (i) => await F.sha256(i), sample: 'Code Formatter Pro' },
  { id: 'gen-sha1', name: 'SHA-1 Hash', category: 'Generators', desc: 'Generate a SHA-1 hash of the input.', inLang: 'plaintext', outLang: 'plaintext', ext: 'txt', run: async (i) => await F.sha1(i), sample: 'Code Formatter Pro' },
]

export const CATEGORIES = [
  'Formatters',
  'Minifiers',
  'Converters',
  'Encoders / Decoders',
  'Text Tools',
  'Generators',
]
