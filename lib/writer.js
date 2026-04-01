'use strict';

const fs   = require('fs');
const path = require('path');
const { log } = require('./utils');

/**
 * writeOutput(outputPath, content, options)
 *
 * Writes content to outputPath.
 * If the file already exists and options.force is not set, throws an error.
 *
 * @param {string} outputPath - absolute path to write
 * @param {string} content    - markdown content
 * @param {object} options    - { force: boolean }
 */
async function writeOutput(outputPath, content, options) {
  options = options || {};

  const exists = fs.existsSync(outputPath);

  if (exists && !options.force) {
    throw new Error(
      `File already exists: ${outputPath}\n` +
      'Use --force to overwrite, or specify a different --output filename.'
    );
  }

  // Ensure the directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf8');
  log('info', `Wrote ${content.length} bytes to ${outputPath}`);
}

module.exports = { writeOutput };
