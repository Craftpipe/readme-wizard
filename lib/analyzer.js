'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Framework detection signatures mapped to dependency names
 */
const FRAMEWORK_SIGNATURES = {
  // Frontend frameworks
  react: { deps: ['react'], category: 'frontend', label: 'React' },
  vue: { deps: ['vue'], category: 'frontend', label: 'Vue.js' },
  angular: { deps: ['@angular/core'], category: 'frontend', label: 'Angular' },
  svelte: { deps: ['svelte'], category: 'frontend', label: 'Svelte' },
  nextjs: { deps: ['next'], category: 'fullstack', label: 'Next.js' },
  nuxt: { deps: ['nuxt'], category: 'fullstack', label: 'Nuxt.js' },
  gatsby: { deps: ['gatsby'], category: 'frontend', label: 'Gatsby' },
  remix: { deps: ['@remix-run/node', '@remix-run/react'], category: 'fullstack', label: 'Remix' },

  // Backend frameworks
  express: { deps: ['express'], category: 'backend', label: 'Express.js' },
  fastify: { deps: ['fastify'], category: 'backend', label: 'Fastify' },
  koa: { deps: ['koa'], category: 'backend', label: 'Koa' },
  hapi: { deps: ['@hapi/hapi'], category: 'backend', label: 'Hapi.js' },
  nestjs: { deps: ['@nestjs/core'], category: 'backend', label: 'NestJS' },
  sails: { deps: ['sails'], category: 'backend', label: 'Sails.js' },
  loopback: { deps: ['@loopback/core'], category: 'backend', label: 'LoopBack' },

  // Databases / ORMs
  mongoose: { deps: ['mongoose'], category: 'database', label: 'Mongoose (MongoDB)' },
  sequelize: { deps: ['sequelize'], category: 'database', label: 'Sequelize' },
  prisma: { deps: ['@prisma/client'], category: 'database', label: 'Prisma' },
  typeorm: { deps: ['typeorm'], category: 'database', label: 'TypeORM' },
  knex: { deps: ['knex'], category: 'database', label: 'Knex.js' },
  redis: { deps: ['redis', 'ioredis'], category: 'database', label: 'Redis' },

  // Testing frameworks
  jest: { deps: ['jest'], category: 'testing', label: 'Jest' },
  mocha: { deps: ['mocha'], category: 'testing', label: 'Mocha' },
  vitest: { deps: ['vitest'], category: 'testing', label: 'Vitest' },
  jasmine: { deps: ['jasmine'], category: 'testing', label: 'Jasmine' },
  ava: { deps: ['ava'], category: 'testing', label: 'AVA' },
  cypress: { deps: ['cypress'], category: 'testing', label: 'Cypress' },
  playwright: { deps: ['@playwright/test', 'playwright'], category: 'testing', label: 'Playwright' },

  // Build tools
  webpack: { deps: ['webpack'], category: 'build', label: 'Webpack' },
  vite: { deps: ['vite'], category: 'build', label: 'Vite' },
  rollup: { deps: ['rollup'], category: 'build', label: 'Rollup' },
  parcel: { deps: ['parcel'], category: 'build', label: 'Parcel' },
  esbuild: { deps: ['esbuild'], category: 'build', label: 'esbuild' },
  babel: { deps: ['@babel/core'], category: 'build', label: 'Babel' },

  // Utilities / misc
  typescript: { deps: ['typescript'], category: 'language', label: 'TypeScript' },
  graphql: { deps: ['graphql', 'apollo-server'], category: 'api', label: 'GraphQL' },
  socket_io: { deps: ['socket.io'], category: 'realtime', label: 'Socket.IO' },
  electron: { deps: ['electron'], category: 'desktop', label: 'Electron' },
  commander: { deps: ['commander'], category: 'cli', label: 'Commander.js' },
  yargs: { deps: ['yargs'], category: 'cli', label: 'Yargs' },
  inquirer: { deps: ['inquirer'], category: 'cli', label: 'Inquirer.js' },
  chalk: { deps: ['chalk'], category: 'cli', label: 'Chalk' },
  dotenv: { deps: ['dotenv'], category: 'config', label: 'dotenv' },
  axios: { deps: ['axios'], category: 'http', label: 'Axios' },
  lodash: { deps: ['lodash'], category: 'utility', label: 'Lodash' },
  moment: { deps: ['moment'], category: 'utility', label: 'Moment.js' },
  dayjs: { deps: ['dayjs'], category: 'utility', label: 'Day.js' },
};

/**
 * Common entry point file names to look for
 */
const ENTRY_POINT_CANDIDATES = [
  'index.js',
  'index.mjs',
  'index.cjs',
  'app.js',
  'app.mjs',
  'server.js',
  'server.mjs',
  'main.js',
  'main.mjs',
  'cli.js',
  'bin/index.js',
  'bin/cli.js',
  'src/index.js',
  'src/index.mjs',
  'src/app.js',
  'src/server.js',
  'src/main.js',
  'lib/index.js',
];

/**
 * Safely reads and parses a JSON file
 * @param {string} filePath - Absolute path to the JSON file
 * @returns {object|null} Parsed JSON object or null on failure
 */
function readJsonSafe(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (_) {
    return null;
  }
}

/**
 * Checks whether a file exists at the given path
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (_) {
    return false;
  }
}

/**
 * Detects frameworks and notable dependencies used in the project
 * by inspecting both dependencies and devDependencies from package.json.
 *
 * @param {object} packageJson - Parsed package.json object
 * @returns {object} Detection result with arrays: frameworks, devFrameworks, allDetected, categories
 */
function detectFrameworks(packageJson) {
  if (!packageJson || typeof packageJson !== 'object') {
    return { frameworks: [], devFrameworks: [], allDetected: [], categories: {} };
  }

  const deps = Object.keys(packageJson.dependencies || {});
  const devDeps = Object.keys(packageJson.devDependencies || {});
  const allDeps = new Set([...deps, ...devDeps]);

  const frameworks = [];
  const devFrameworks = [];
  const categories = {};

  for (const [key, signature] of Object.entries(FRAMEWORK_SIGNATURES)) {
    const matched = signature.deps.some((dep) => allDeps.has(dep));
    if (!matched) continue;

    const isProd = signature.deps.some((dep) => deps.includes(dep));
    const entry = {
      key,
      label: signature.label,
      category: signature.category,
      isDev: !isProd,
    };

    if (isProd) {
      frameworks.push(entry);
    } else {
      devFrameworks.push(entry);
    }

    if (!categories[signature.category]) {
      categories[signature.category] = [];
    }
    categories[signature.category].push(entry);
  }

  return {
    frameworks,
    devFrameworks,
    allDetected: [...frameworks, ...devFrameworks],
    categories,
  };
}

/**
 * Finds the likely entry point(s) for the project.
 * Checks package.json "main" and "bin" fields first, then falls back
 * to scanning common file name candidates.
 *
 * @param {string} projectDir - Absolute path to the project root
 * @param {object} packageJson - Parsed package.json object
 * @returns {object} Entry point info: primary, bin, candidates, all
 */
function findEntryPoints(projectDir, packageJson) {
  if (!projectDir || typeof projectDir !== 'string') {
    return { primary: null, bin: [], candidates: [], all: [] };
  }

  const pkg = packageJson || {};
  const found = [];
  const binEntries = [];

  // Check "main" field
  let primary = null;
  if (pkg.main) {
    const mainPath = path.resolve(projectDir, pkg.main);
    if (fileExists(mainPath)) {
      primary = pkg.main;
      found.push({ file: pkg.main, type: 'main', exists: true });
    } else {
      found.push({ file: pkg.main, type: 'main', exists: false });
    }
  }

  // Check "bin" field
  if (pkg.bin) {
    if (typeof pkg.bin === 'string') {
      const binPath = path.resolve(projectDir, pkg.bin);
      const entry = { file: pkg.bin, type: 'bin', exists: fileExists(binPath) };
      binEntries.push(entry);
      found.push(entry);
    } else if (typeof pkg.bin === 'object') {
      for (const [binName, binFile] of Object.entries(pkg.bin)) {
        const binPath = path.resolve(projectDir, binFile);
        const entry = { file: binFile, name: binName, type: 'bin', exists: fileExists(binPath) };
        binEntries.push(entry);
        found.push(entry);
      }
    }
  }

  // Check "module" field (ESM)
  if (pkg.module) {
    const modulePath = path.resolve(projectDir, pkg.module);
    found.push({ file: pkg.module, type: 'module', exists: fileExists(modulePath) });
  }

  // Scan common candidates
  const candidates = [];
  for (const candidate of ENTRY_POINT_CANDIDATES) {
    const candidatePath = path.resolve(projectDir, candidate);
    if (fileExists(candidatePath)) {
      const alreadyFound = found.some((f) => f.file === candidate);
      if (!alreadyFound) {
        candidates.push({ file: candidate, type: 'candidate', exists: true });
      }
    }
  }

  // Determine primary if not set from "main"
  if (!primary) {
    const firstExisting = found.find((f) => f.exists && f.type !== 'bin');
    if (firstExisting) {
      primary = firstExisting.file;
    } else if (candidates.length > 0) {
      primary = candidates[0].file;
    }
  }

  return {
    primary,
    bin: binEntries,
    candidates,
    all: [...found, ...candidates],
  };
}

/**
 * Scans the project directory for common patterns such as test directories,
 * documentation folders, and configuration files.
 *
 * @param {string} projectDir - Absolute path to the project root
 * @returns {object} Pattern detection results
 */
function scanCommonPatterns(projectDir) {
  const patterns = {
    hasTests: false,
    testDirs: [],
    hasDocs: false,
    docDirs: [],
    hasConfig: false,
    configFiles: [],
    hasCI: false,
    ciFiles: [],
    hasDocker: false,
    dockerFiles: [],
    hasLicense: false,
    hasChangelog: false,
    hasContributing: false,
    hasEditorConfig: false,
    hasEslint: false,
    hasPrettier: false,
    hasGitignore: false,
    hasMakefile: false,
    hasEnvExample: false,
  };

  const testDirCandidates = ['test', 'tests', '__tests__', 'spec', 'specs', 'src/__tests__'];
  const docDirCandidates = ['docs', 'doc', 'documentation', 'wiki'];
  const configFileCandidates = [
    'jest.config.js', 'jest.config.ts', 'jest.config.json',
    'vitest.config.js', 'vitest.config.ts',
    'webpack.config.js', 'webpack.config.ts',
    'vite.config.js', 'vite.config.ts',
    'rollup.config.js', 'rollup.config.ts',
    'babel.config.js', 'babel.config.json', '.babelrc',
    'tsconfig.json', 'tsconfig.base.json',
    'tailwind.config.js', 'tailwind.config.ts',
    'postcss.config.js',
    '.env', '.env.local',
  ];
  const ciFileCandidates = [
    '.github/workflows',
    '.travis.yml',
    '.circleci/config.yml',
    'Jenkinsfile',
    '.gitlab-ci.yml',
    'azure-pipelines.yml',
    '.github/workflows/ci.yml',
    '.github/workflows/test.yml',
  ];
  const dockerFileCandidates = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore'];

  // Test directories
  for (const dir of testDirCandidates) {
    const fullPath = path.resolve(projectDir, dir);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        patterns.hasTests = true;
        patterns.testDirs.push(dir);
      }
    } catch (_) {
      // Check for test files in root
    }
  }

  // Also check for test files in root
  if (!patterns.hasTests) {
    try {
      const rootFiles = fs.readdirSync(projectDir);
      const testFilePattern = /\.(test|spec)\.(js|ts|mjs|cjs)$/;
      if (rootFiles.some((f) => testFilePattern.test(f))) {
        patterns.hasTests = true;
      }
    } catch (_) {}
  }

  // Doc directories
  for (const dir of docDirCandidates) {
    const fullPath = path.resolve(projectDir, dir);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        patterns.hasDocs = true;
        patterns.docDirs.push(dir);
      }
    } catch (_) {}
  }

  // Config files
  for (const file of configFileCandidates) {
    const fullPath = path.resolve(projectDir, file);
    if (fileExists(fullPath)) {
      patterns.hasConfig = true;
      patterns.configFiles.push(file);
    }
  }

  // CI files
  for (const file of ciFileCandidates) {
    const fullPath = path.resolve(projectDir, file);
    try {
      if (fs.existsSync(fullPath)) {
        patterns.hasCI = true;
        patterns.ciFiles.push(file);
      }
    } catch (_) {}
  }

  // Docker files
  for (const file of dockerFileCandidates) {
    const fullPath = path.resolve(projectDir, file);
    if (fileExists(fullPath)) {
      patterns.hasDocker = true;
      patterns.dockerFiles.push(file);
    }
  }

  // Single-file checks
  const singleChecks = [
    ['LICENSE', 'hasLicense'],
    ['LICENSE.md', 'hasLicense'],
    ['LICENSE.txt', 'hasLicense'],
    ['CHANGELOG.md', 'hasChangelog'],
    ['CHANGELOG', 'hasChangelog'],
    ['CONTRIBUTING.md', 'hasContributing'],
    ['CONTRIBUTING', 'hasContributing'],
    ['.editorconfig', 'hasEditorConfig'],
    ['.eslintrc', 'hasEslint'],
    ['.eslintrc.js', 'hasEslint'],
    ['.eslintrc.json', 'hasEslint'],
    ['.eslintrc.yml', 'hasEslint'],
    ['eslint.config.js', 'hasEslint'],
    ['.prettierrc', 'hasPrettier'],
    ['.prettierrc.js', 'hasPrettier'],
    ['.prettierrc.json', 'hasPrettier'],
    ['prettier.config.js', 'hasPrettier'],
    ['.gitignore', 'hasGitignore'],
    ['Makefile', 'hasMakefile'],
    ['.env.example', 'hasEnvExample'],
    ['.env.sample', 'hasEnvExample'],
  ];

  for (const [file, prop] of singleChecks) {
    if (!patterns[prop] && fileExists(path.resolve(projectDir, file))) {
      patterns[prop] = true;
    }
  }

  return patterns;
}

/**
 * Extracts rich metadata from the project directory and package.json.
 * Combines package.json fields with filesystem analysis.
 *
 * @param {string} projectDir - Absolute path to the project root
 * @param {object} [packageJson] - Optional pre-parsed package.json (will be read if not provided)
 * @returns {object} Extracted metadata object
 */
function extractMetadata(projectDir, packageJson) {
  const result = {
    name: '',
    version: '1.0.0',
    description: '',
    author: '',
    authorEmail: '',
    authorUrl: '',
    license: 'MIT',
    homepage: '',
    repository: null,
    repositoryUrl: '',
    keywords: [],
    engines: {},
    scripts: {},
    hasPublishConfig: false,
    isPrivate: false,
    isModule: false,
    isCli: false,
    binCommands: [],
    nodeVersion: null,
    npmVersion: null,
    packageManager: null,
  };

  if (!projectDir || typeof projectDir !== 'string') {
    return result;
  }

  const pkg = packageJson || readJsonSafe(path.resolve(projectDir, 'package.json')) || {};

  // Basic fields
  result.name = pkg.name || path.basename(projectDir) || '';
  result.version = pkg.version || '1.0.0';
  result.description = pkg.description || '';
  result.license = pkg.license || 'MIT';
  result.homepage = pkg.homepage || '';
  result.keywords = Array.isArray(pkg.keywords) ? pkg.keywords : [];
  result.engines = pkg.engines || {};
  result.scripts = pkg.scripts || {};
  result.isPrivate = pkg.private === true;
  result.isModule = pkg.type === 'module';

  // Node version from engines
  if (pkg.engines && pkg.engines.node) {
    result.nodeVersion = pkg.engines.node;
  }

  // Author parsing
  if (pkg.author) {
    if (typeof pkg.author === 'string') {
      // Format: "Name <email> (url)"
      const authorMatch = pkg.author.match(/^([^<(]+?)(?:\s*<([^>]+)>)?(?:\s*\(([^)]+)\))?$/);
      if (authorMatch) {
        result.author = (authorMatch[1] || '').trim();
        result.authorEmail = (authorMatch[2] || '').trim();
        result.authorUrl = (authorMatch[3] || '').trim();
      } else {
        result.author = pkg.author;
      }
    } else if (typeof pkg.author === 'object') {
      result.author = pkg.author.name || '';
      result.authorEmail = pkg.author.email || '';
      result.authorUrl = pkg.author.url || '';
    }
  }

  // Repository parsing
  if (pkg.repository) {
    if (typeof pkg.repository === 'string') {
      result.repository = { type: 'git', url: pkg.repository };
      result.repositoryUrl = pkg.repository;
    } else if (typeof pkg.repository === 'object') {
      result.repository = pkg.repository;
      result.repositoryUrl = pkg.repository.url || '';
    }

    // Normalize GitHub shorthand (e.g., "user/repo")
    if (result.repositoryUrl && !result.repositoryUrl.startsWith('http') && !result.repositoryUrl.startsWith('git')) {
      result.repositoryUrl = `https://github.com/${result.repositoryUrl}`;
    }

    // Clean up git+ prefix and .git suffix for display
    result.repositoryUrl = result.repositoryUrl
      .replace(/^git\+/, '')
      .replace(/\.git$/, '');
  }

  // Bin / CLI detection
  if (pkg.bin) {
    result.isCli = true;
    if (typeof pkg.bin === 'string') {
      result.binCommands = [{ command: result.name, file: pkg.bin }];
    } else if (typeof pkg.bin === 'object') {
      result.binCommands = Object.entries(pkg.bin).map(([cmd, file]) => ({ command: cmd, file }));
    }
  }

  // Package manager detection
  if (pkg.packageManager) {
    result.packageManager = pkg.packageManager;
  } else {
    // Detect from lock files
    if (fileExists(path.resolve(projectDir, 'yarn.lock'))) {
      result.packageManager = 'yarn';
    } else if (fileExists(path.resolve(projectDir, 'pnpm-lock.yaml'))) {
      result.packageManager = 'pnpm';
    } else if (fileExists(path.resolve(projectDir, 'package-lock.json'))) {
      result.packageManager = 'npm';
    } else {
      result.packageManager = 'npm';
    }
  }

  result.hasPublishConfig = !!pkg.publishConfig;

  return result;
}

/**
 * Counts files by extension in a directory recursively (lightweight version
 * used internally — the full scanner is in lib/scanner.js).
 *
 * @param {string} dir - Directory to scan
 * @param {Set<string>} [visited] - Set of visited paths to prevent cycles
 * @param {number} [depth] - Current recursion depth
 * @returns {object} Map of extension -> count
 */
function countFilesByExtension(dir, visited = new Set(), depth = 0) {
  const counts = {};
  const MAX_DEPTH = 8;
  const IGNORE_DIRS = new Set([
    'node_modules', '.git', '.svn', '.hg', 'dist', 'build',
    'coverage', '.nyc_output', '.cache', 'tmp', 'temp',
    '.next', '.nuxt', '.output', 'out',
  ]);

  if (depth > MAX_DEPTH) return counts;

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return counts;
  }

  for (const entry of entries) {
    const fullPath = path.resolve(dir, entry.name);

    if (entry.isSymbolicLink()) continue;

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      if (visited.has(fullPath)) continue;
      visited.add(fullPath);

      const subCounts = countFilesByExtension(fullPath, visited, depth + 1);
      for (const [ext, count] of Object.entries(subCounts)) {
        counts[ext] = (counts[ext] || 0) + count;
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase() || '(no ext)';
      counts[ext] = (counts[ext] || 0) + 1;
    }
  }

  return counts;
}

/**
 * Performs a full analysis of the project directory.
 * Reads package.json, detects frameworks, finds entry points,
 * counts files, and scans for common patterns.
 *
 * @param {string} projectDir - Absolute path to the project root
 * @returns {object} Complete analysis result object
 */
function analyzeProject(projectDir) {
  const result = {
    projectDir: '',
    packageJson: null,
    metadata: {},
    frameworks: {
      frameworks: [],
      devFrameworks: [],
      allDetected: [],
      categories: {},
    },
    entryPoints: {
      primary: null,
      bin: [],
      candidates: [],
      all: [],
    },
    fileCounts: {},
    totalFiles: 0,
    patterns: {},
    errors: [],
    analyzedAt: new Date().toISOString(),
  };

  // Validate projectDir
  if (!projectDir || typeof projectDir !== 'string') {
    result.errors.push('Invalid project directory: must be a non-empty string');
    return result;
  }

  const resolvedDir = path.resolve(projectDir);
  result.projectDir = resolvedDir;

  // Check directory exists
  try {
    const stat = fs.statSync(resolvedDir);
    if (!stat.isDirectory()) {
      result.errors.push(`Path is not a directory: ${resolvedDir}`);
      return result;
    }
  } catch (err) {
    result.errors.push(`Cannot access project directory: ${err.message}`);
    return result;
  }

  // Read package.json
  const pkgPath = path.resolve(resolvedDir, 'package.json');
  const packageJson = readJsonSafe(pkgPath);

  if (!packageJson) {
    result.errors.push('package.json not found or invalid — analysis will be limited');
  }

  result.packageJson = packageJson;

  // Extract metadata
  try {
    result.metadata = extractMetadata(resolvedDir, packageJson);
  } catch (err) {
    result.errors.push(`Metadata extraction failed: ${err.message}`);
    result.metadata = extractMetadata(resolvedDir, null);
  }

  // Detect frameworks
  try {
    result.frameworks = detectFrameworks(packageJson);
  } catch (err) {
    result.errors.push(`Framework detection failed: ${err.message}`);
  }

  // Find entry points
  try {
    result.entryPoints = findEntryPoints(resolvedDir, packageJson);
  } catch (err) {
    result.errors.push(`Entry point detection failed: ${err.message}`);
  }

  // Count files by extension
  try {
    result.fileCounts = countFilesByExtension(resolvedDir);
    result.totalFiles = Object.values(result.fileCounts).reduce((sum, n) => sum + n, 0);
  } catch (err) {
    result.errors.push(`File counting failed: ${err.message}`);
  }

  // Scan common patterns
  try {
    result.patterns = scanCommonPatterns(resolvedDir);
  } catch (err) {
    result.errors.push(`Pattern scanning failed: ${err.message}`);
  }

  return result;
}

module.exports = {
  analyzeProject,
  detectFrameworks,
  findEntryPoints,
  extractMetadata,
};