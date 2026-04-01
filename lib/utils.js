// lib/utils.js
'use strict';

const LEVELS = {
  info: { prefix: 'i', color: '\x1b[36m' },
  warn: { prefix: '!', color: '\x1b[33m' },
  error: { prefix: 'x', color: '\x1b[31m' },
  success: { prefix: 'v', color: '\x1b[32m' },
};

const RESET = '\x1b[0m';

/**
 * Log a message to stderr.
 * @param {'info'|'warn'|'error'|'success'} level
 * @param {string} message
 */
function log(level, message) {
  const lvl = LEVELS[level] || LEVELS.info;
  const label = level.toUpperCase().padEnd(7);
  process.stderr.write(`${lvl.color}[${label}]${RESET} ${message}\n`);
}

module.exports = { log };
