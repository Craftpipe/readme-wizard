'use strict';

/**
 * @fileoverview Markdown and text formatting utilities for readme-wizard.
 * Provides ASCII art banner generation, shields.io badge URL builders,
 * code block formatters, and reusable section templates.
 */

// ---------------------------------------------------------------------------
// ASCII Art character map (block-letter style using simple pipe/underscore art)
// ---------------------------------------------------------------------------

/**
 * A minimal 5-row block-letter font for uppercase A-Z, digits 0-9,
 * hyphen, dot, underscore, space, and a fallback for unknown chars.
 * Each character is represented as an array of 5 strings (rows).
 */
const BLOCK_FONT = {
  ' ': ['   ', '   ', '   ', '   ', '   '],
  'A': [' _ ', '/ \\', '|_|', '| |', '   '],
  'B': ['|_ ', '|_|', '|_|', '|_ ', '   '],
  'C': [' _ ', '|  ', '|  ', ' _ ', '   '],
  'D': ['|_ ', '| \\', '| /', '|_ ', '   '],
  'E': ['|_ ', '|_ ', '|  ', '|_ ', '   '],
  'F': ['|_ ', '|_ ', '|  ', '|  ', '   '],
  'G': [' _ ', '|  ', '|_ ', ' _|', '   '],
  'H': ['| |', '|_|', '| |', '| |', '   '],
  'I': ['|', '|', '|', '|', ' '],
  'J': ['  |', '  |', '  |', ' _|', '   '],
  'K': ['| /', '|/ ', '|\\ ', '| \\', '   '],
  'L': ['|  ', '|  ', '|  ', '|_ ', '   '],
  'M': ['|\\ /|', '| V |', '|   |', '|   |', '     '],
  'N': ['|\\ |', '| \\|', '|  |', '|  |', '    '],
  'O': [' _ ', '| |', '| |', ' _ ', '   '],
  'P': ['|_ ', '|_|', '|  ', '|  ', '   '],
  'Q': [' _  ', '| | ', '| | ', ' _\\ ', '    '],
  'R': ['|_ ', '|_|', '|\\ ', '| \\', '   '],
  'S': [' _ ', '|_ ', ' _|', '|_ ', '   '],
  'T': ['___', ' | ', ' | ', ' | ', '   '],
  'U': ['| |', '| |', '| |', ' _ ', '   '],
  'V': ['| |', '| |', '\\ /', ' V ', '   '],
  'W': ['|   |', '|   |', '| | |', ' \\_/ ', '     '],
  'X': ['\\ /', ' X ', '/ \\', '/   \\', '     '],
  'Y': ['| |', '\\ /', ' | ', ' | ', '   '],
  'Z': ['__ ', ' / ', '/  ', '__ ', '   '],
  '0': [' _ ', '|/|', '| |', ' _ ', '   '],
  '1': [' _|', '  |', '  |', '  |', '   '],
  '2': [' _ ', ' _|', '|_ ', '__ ', '   '],
  '3': ['__ ', ' _|', ' _|', '__ ', '   '],
  '4': ['| |', '|_|', '  |', '  |', '   '],
  '5': ['|_ ', '|_ ', ' _|', '|_ ', '   '],
  '6': [' _ ', '|_ ', '|_|', ' _ ', '   '],
  '7': ['__ ', '  |', '  |', '  |', '   '],
  '8': [' _ ', '|_|', '|_|', ' _ ', '   '],
  '9': [' _ ', '|_|', ' _|', '__ ', '   '],
  '-': ['   ', '__ ', '   ', '   ', '   '],
  '.': ['  ', '  ', '  ', ' .', '  '],
  '_': ['   ', '   ', '   ', '___', '   '],
  '/': ['  /', ' / ', '/  ', '   ', '   '],
  '\\': ['\\  ', ' \\ ', '  \\', '   ', '   '],
  '!': ['|', '|', '|', '.', ' '],
  '?': [' _ ', ' _|', '   ', ' ? ', '   '],
  '@': [' _  ', '|_ |', '|__|', '    ', '    '],
  '#': [' # ', '###', ' # ', '###', '   '],
  '+': ['   ', ' + ', '+++', ' + ', '   '],
  '=': ['   ', '===', '   ', '===', '   '],
  ':': [' ', '.', ' ', '.', ' '],
};

/**
 * Number of rows in the block font
 */
const FONT_ROWS = 5;

/**
 * Render a single character from the block font.
 * Falls back to a simple bracketed character if not found.
 * @param {string} char - Single character to render
 * @returns {string[]} Array of FONT_ROWS strings representing the character
 */
function renderChar(char) {
  const upper = char.toUpperCase();
  if (BLOCK_FONT[upper]) {
    return BLOCK_FONT[upper];
  }
  // Fallback: render as [X] style across rows
  const w = Math.max(3, char.length + 2);
  const top = '[' + char.toUpperCase().padEnd(w - 2, ' ') + ']';
  const mid = '|' + ' '.repeat(w - 2) + '|';
  return [top, mid, mid, top, ' '.repeat(w)];
}

/**
 * Generate a simple ASCII art banner for the given text.
 * Uses a 5-row block-letter style with a decorative border.
 *
 * @param {string} text - The text to render as ASCII art
 * @param {object} [options] - Optional configuration
 * @param {string} [options.style='block'] - Banner style: 'block' | 'simple' | 'box'
 * @param {string} [options.borderChar='*'] - Character used for the border (box/simple styles)
 * @returns {string} Multi-line ASCII art banner string
 */
function generateAsciiBanner(text, options) {
  if (!text || typeof text !== 'string') return '';

  const opts = Object.assign({ style: 'block', borderChar: '*' }, options || {});
  const style = opts.style || 'block';
  const borderChar = (typeof opts.borderChar === 'string' && opts.borderChar.length > 0)
    ? opts.borderChar[0]
    : '*';

  // ── simple style: just a bordered box around the plain text ──────────────
  if (style === 'simple') {
    const inner = ' ' + text + ' ';
    const border = borderChar.repeat(inner.length + 2);
    return [border, borderChar + inner + borderChar, border].join('\n');
  }

  // ── box style: double-line box ────────────────────────────────────────────
  if (style === 'box') {
    const inner = '  ' + text + '  ';
    const width = inner.length + 2;
    const top    = '╔' + '═'.repeat(width - 2) + '╗';
    const middle = '║' + inner + '║';
    const bottom = '╚' + '═'.repeat(width - 2) + '╝';
    return [top, middle, bottom].join('\n');
  }

  // ── block style: 5-row block letters ─────────────────────────────────────
  try {
    const chars = text.split('');
    const charGlyphs = chars.map(renderChar);

    // Build each row by concatenating all character rows with a space separator
    const rows = [];
    for (let row = 0; row < FONT_ROWS; row++) {
      rows.push(charGlyphs.map(g => g[row] || '').join(' '));
    }

    // Determine the width of the widest row for the border
    const maxWidth = rows.reduce((max, r) => Math.max(max, r.length), 0);
    const border = borderChar.repeat(maxWidth + 4);
    const paddedRows = rows.map(r => borderChar + ' ' + r.padEnd(maxWidth, ' ') + ' ' + borderChar);

    return [border, ...paddedRows, border].join('\n');
  } catch (_err) {
    // Graceful fallback to simple style
    const inner = ' ' + text + ' ';
    const border = borderChar.repeat(inner.length + 2);
    return [border, borderChar + inner + borderChar, border].join('\n');
  }
}

// ---------------------------------------------------------------------------
// Badge builder
// ---------------------------------------------------------------------------

/**
 * Known color aliases for shields.io badges
 */
const BADGE_COLOR_ALIASES = {
  green:       'brightgreen',
  success:     'brightgreen',
  passing:     'brightgreen',
  warning:     'yellow',
  warn:        'yellow',
  danger:      'red',
  error:       'red',
  failing:     'red',
  info:        'blue',
  default:     'blue',
  inactive:    'lightgrey',
  grey:        'lightgrey',
  gray:        'lightgrey',
};

/**
 * Escape a string segment for use in a shields.io badge URL path.
 * Shields.io uses `-` as a separator, so literal dashes must be doubled,
 * underscores must be doubled, and spaces become `_`.
 *
 * @param {string} value - Raw string to escape
 * @returns {string} Escaped string safe for shields.io badge URLs
 */
function escapeBadgeSegment(value) {
  return String(value || '')
    .replace(/_/g, '__')   // escape underscores first
    .replace(/-/g, '--')   // escape dashes
    .replace(/ /g, '_');   // spaces become underscores
}

/**
 * Build a shields.io static badge URL.
 *
 * @param {string} label   - Left-hand label text (e.g. 'npm')
 * @param {string} message - Right-hand message text (e.g. '1.0.0')
 * @param {string} [color] - Badge color name or hex (default: 'blue')
 * @param {object} [opts]  - Additional options
 * @param {string} [opts.style]   - Badge style: flat | flat-square | plastic | for-the-badge | social
 * @param {string} [opts.logo]    - Simple-icons logo name
 * @param {string} [opts.link]    - URL to wrap the badge in (returns markdown image link)
 * @param {boolean} [opts.markdown] - If true, return full markdown image syntax
 * @returns {string} shields.io badge URL (or markdown image string if opts.markdown is true)
 */
function buildBadgeUrl(label, message, color, opts) {
  if (label === null || label === undefined) label = '';
  if (message === null || message === undefined) message = '';
  if (!color) color = 'blue';

  const options = Object.assign({}, opts || {});

  // Resolve color aliases
  const resolvedColor = BADGE_COLOR_ALIASES[String(color).toLowerCase()] || String(color);

  const safeLabel   = escapeBadgeSegment(label);
  const safeMessage = escapeBadgeSegment(message);
  const safeColor   = encodeURIComponent(resolvedColor);

  let url = `https://img.shields.io/badge/${encodeURIComponent(safeLabel)}-${encodeURIComponent(safeMessage)}-${safeColor}`;

  // Append query params
  const params = [];
  if (options.style) {
    const validStyles = ['flat', 'flat-square', 'plastic', 'for-the-badge', 'social'];
    if (validStyles.includes(options.style)) {
      params.push('style=' + encodeURIComponent(options.style));
    }
  }
  if (options.logo && typeof options.logo === 'string') {
    params.push('logo=' + encodeURIComponent(options.logo));
  }
  if (params.length > 0) {
    url += '?' + params.join('&');
  }

  // Return markdown image syntax if requested
  if (options.markdown || options.link) {
    const altText = [label, message].filter(Boolean).join(': ');
    const imgTag = `![${altText}](${url})`;
    if (options.link && typeof options.link === 'string') {
      return `[${imgTag}](${options.link})`;
    }
    return imgTag;
  }

  return url;
}

// ---------------------------------------------------------------------------
// Code block formatter
// ---------------------------------------------------------------------------

/**
 * Language aliases normalised to their canonical fenced-code identifier
 */
const LANG_ALIASES = {
  js:         'javascript',
  ts:         'typescript',
  py:         'python',
  rb:         'ruby',
  sh:         'bash',
  shell:      'bash',
  zsh:        'bash',
  yml:        'yaml',
  md:         'markdown',
  dockerfile: 'dockerfile',
  tf:         'hcl',
  rs:         'rust',
  kt:         'kotlin',
  cs:         'csharp',
  cpp:        'cpp',
  'c++':      'cpp',
  cc:         'cpp',
  h:          'c',
  hpp:        'cpp',
  go:         'go',
  java:       'java',
  php:        'php',
  swift:      'swift',
  r:          'r',
  sql:        'sql',
  html:       'html',
  css:        'css',
  scss:       'scss',
  sass:       'sass',
  less:       'less',
  json:       'json',
  xml:        'xml',
  toml:       'toml',
  ini:        'ini',
  env:        'bash',
};

/**
 * Format a fenced Markdown code block.
 *
 * @param {string} code          - The code content to wrap
 * @param {string} [lang]        - Language identifier (e.g. 'javascript', 'bash')
 * @param {object} [options]     - Optional configuration
 * @param {string} [options.filename]  - Optional filename shown as a comment above the block
 * @param {boolean} [options.trim]     - Trim leading/trailing whitespace from code (default: true)
 * @param {string} [options.fence]     - Fence character sequence (default: '```')
 * @returns {string} Fenced markdown code block
 */
function formatCodeBlock(code, lang, options) {
  if (code === null || code === undefined) code = '';
  code = String(code);

  const opts = Object.assign({ trim: true }, options || {});

  // Normalise language identifier
  let language = '';
  if (lang && typeof lang === 'string' && lang.trim().length > 0) {
    const normalised = lang.trim().toLowerCase();
    language = LANG_ALIASES[normalised] || normalised;
  }

  // Trim code if requested
  if (opts.trim) {
    code = code.trim();
  }

  // Determine fence — if the code itself contains ```, use ~~~~ instead
  let fence = (opts.fence && typeof opts.fence === 'string') ? opts.fence : '```';
  if (fence === '```' && code.includes('```')) {
    fence = '~~~~';
  }

  const parts = [];

  // Optional filename comment
  if (opts.filename && typeof opts.filename === 'string' && opts.filename.trim().length > 0) {
    parts.push(`<!-- ${opts.filename.trim()} -->`);
  }

  parts.push(`${fence}${language}`);
  parts.push(code);
  parts.push(fence);

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Section formatter
// ---------------------------------------------------------------------------

/**
 * Heading level labels for validation
 */
const MIN_HEADING_LEVEL = 1;
const MAX_HEADING_LEVEL = 6;

/**
 * Format a Markdown section with a heading and body content.
 *
 * @param {string} title         - Section heading text
 * @param {string} body          - Section body content (markdown)
 * @param {number} [level=2]     - Heading level 1–6 (default: 2)
 * @param {object} [options]     - Optional configuration
 * @param {boolean} [options.trailingNewline=true]  - Append a trailing newline after the section
 * @param {string}  [options.prefix]                - Optional prefix string prepended before the heading (e.g. an emoji)
 * @param {boolean} [options.anchor]                - If true, insert an HTML anchor above the heading
 * @returns {string} Formatted markdown section string
 */
function formatSection(title, body, level, options) {
  if (!title || typeof title !== 'string') title = '';
  if (body === null || body === undefined) body = '';
  body = String(body);

  // Clamp heading level
  let headingLevel = parseInt(level, 10);
  if (isNaN(headingLevel) || headingLevel < MIN_HEADING_LEVEL) headingLevel = 2;
  if (headingLevel > MAX_HEADING_LEVEL) headingLevel = MAX_HEADING_LEVEL;

  const opts = Object.assign({ trailingNewline: true }, options || {});

  const hashes = '#'.repeat(headingLevel);
  const prefix = (opts.prefix && typeof opts.prefix === 'string') ? opts.prefix + ' ' : '';
  const headingText = `${hashes} ${prefix}${title.trim()}`;

  const parts = [];

  // Optional HTML anchor for deep-linking
  if (opts.anchor) {
    const anchorId = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    parts.push(`<a name="${anchorId}"></a>`);
  }

  parts.push(headingText);
  parts.push('');

  if (body.trim().length > 0) {
    parts.push(body.trim());
  }

  let result = parts.join('\n');

  if (opts.trailingNewline) {
    result += '\n';
  }

  return result;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  generateAsciiBanner,
  buildBadgeUrl,
  formatCodeBlock,
  formatSection,
};