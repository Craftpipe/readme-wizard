#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { log } = require('./lib/utils');
const { scanProject } = require('./lib/scanner');
const { generateReadme } = require('./lib/generator');

program
  .name('readme-wizard')
  .description('Generate a beautiful README for your project')
  .version('1.0.0')
  .option('-o, --output <file>', 'output filename', 'README.md')
  .option('-f, --force', 'overwrite existing README without prompting')
  .option('-v, --verbose', 'show detailed scan results')
  .option('--dry-run', 'print generated README to stdout without writing')
  .option('--cwd <dir>', 'project directory to scan', process.cwd());

program.parse(process.argv);

const opts = program.opts();

async function main() {
  try {
    const projectDir = path.resolve(opts.cwd);

    if (opts.verbose) {
      log('info', `Scanning project at: ${projectDir}`);
    }

    const projectData = await scanProject(projectDir);

    if (opts.verbose) {
      log('info', `Project name: ${projectData.name}`);
      log('info', `Detected frameworks: ${projectData.frameworks.join(', ') || 'none'}`);
      log('info', `Files scanned: ${projectData.fileCount}`);
    }

    const readme = generateReadme(projectData);

    if (opts.dryRun) {
      process.stdout.write(readme + '\n');
      process.exit(0);
    }

    const outputPath = path.resolve(projectDir, opts.output);

    if (fs.existsSync(outputPath) && !opts.force) {
      log('warn', `${opts.output} already exists. Use --force to overwrite.`);
      process.exit(0);
    }

    fs.writeFileSync(outputPath, readme, 'utf8');
    log('info', `README written to ${outputPath}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
