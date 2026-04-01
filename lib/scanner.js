// lib/scanner.js
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Scans a project directory and returns structured data.
 * @param {string} projectDir - Absolute path to the project root.
 * @returns {Promise<object>} Project data object.
 */
async function scanProject(projectDir) {
  const data = {
    name: path.basename(projectDir),
    description: '',
    version: '',
    license: '',
    main: '',
    bin: {},
    scripts: {},
    engines: {},
    frameworks: [],
    dependencies: {},
    devDependencies: {},
    fileCount: 0,
    isNpmPackage: false,
    hasTests: false,
    directories: [],
  };

  // Read package.json if present
  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      data.name = pkg.name || data.name;
      data.description = pkg.description || '';
      data.version = pkg.version || '';
      data.license = pkg.license || '';
      data.main = pkg.main || '';
      data.bin = pkg.bin || {};
      data.scripts = pkg.scripts || {};
      data.engines = pkg.engines || {};
      data.dependencies = pkg.dependencies || {};
      data.devDependencies = pkg.devDependencies || {};
      data.isNpmPackage = true;
    } catch (e) {
      // ignore parse errors
    }
  }

  // Detect frameworks from dependencies
  const allDeps = Object.keys({
    ...data.dependencies,
    ...data.devDependencies,
  });

  const frameworkMap = {
    express: 'Express',
    fastify: 'Fastify',
    koa: 'Koa',
    hapi: 'Hapi',
    react: 'React',
    'react-dom': 'React',
    vue: 'Vue',
    '@angular/core': 'Angular',
    'next': 'Next.js',
    nuxt: 'Nuxt',
    svelte: 'Svelte',
    prisma: 'Prisma',
    '@prisma/client': 'Prisma',
    mongoose: 'Mongoose',
    sequelize: 'Sequelize',
    typeorm: 'TypeORM',
    jest: 'Jest',
    vitest: 'Vitest',
    mocha: 'Mocha',
    typescript: 'TypeScript',
    webpack: 'Webpack',
    vite: 'Vite',
    rollup: 'Rollup',
    esbuild: 'esbuild',
    graphql: 'GraphQL',
    'apollo-server': 'Apollo',
    socket: 'Socket.io',
    'socket.io': 'Socket.io',
    redis: 'Redis',
    'ioredis': 'Redis',
  };

  const detectedFrameworks = new Set();
  for (const dep of allDeps) {
    if (frameworkMap[dep]) {
      detectedFrameworks.add(frameworkMap[dep]);
    }
  }
  data.frameworks = Array.from(detectedFrameworks);

  // Count files (shallow + one level deep, skip node_modules/.git)
  data.fileCount = countFiles(projectDir, 0, 2);

  // Detect test presence
  data.hasTests = !!(
    data.scripts.test ||
    fs.existsSync(path.join(projectDir, 'test')) ||
    fs.existsSync(path.join(projectDir, '__tests__')) ||
    fs.existsSync(path.join(projectDir, 'spec'))
  );

  // List top-level directories
  try {
    const entries = fs.readdirSync(projectDir, { withFileTypes: true });
    data.directories = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
      .map(e => e.name);
  } catch (e) {
    // ignore
  }

  return data;
}

function countFiles(dir, depth, maxDepth) {
  if (depth > maxDepth) return 0;
  let count = 0;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return 0;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (entry.name === 'node_modules') continue;
    if (entry.isFile()) {
      count++;
    } else if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name), depth + 1, maxDepth);
    }
  }
  return count;
}

module.exports = { scanProject };
