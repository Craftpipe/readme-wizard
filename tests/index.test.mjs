import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── utils.js ────────────────────────────────────────────────────────────────
describe('utils.js', () => {
  let utils;

  beforeEach(() => {
    // Fresh require each time
    delete require.cache[require.resolve('../lib/utils.js')];
    utils = require('../lib/utils.js');
  });

  describe('log', () => {
    it('does not throw for info level', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      expect(() => utils.log('info', 'test message')).not.toThrow();
      spy.mockRestore();
    });

    it('formats output correctly', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      utils.log('info', 'hello world');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('hello world'));
      spy.mockRestore();
    });

    it('suppresses debug when DEBUG not set', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const origDebug = process.env.DEBUG;
      delete process.env.DEBUG;
      utils.log('debug', 'secret');
      expect(spy).not.toHaveBeenCalled();
      if (origDebug !== undefined) process.env.DEBUG = origDebug;
      spy.mockRestore();
    });

    it('shows debug when DEBUG is set', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      process.env.DEBUG = '1';
      utils.log('debug', 'visible');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('visible'));
      delete process.env.DEBUG;
      spy.mockRestore();
    });
  });

  describe('slugify', () => {
    it('converts to lowercase slug', () => {
      expect(utils.slugify('Hello World')).toBe('hello-world');
    });

    it('removes leading/trailing hyphens', () => {
      expect(utils.slugify('  hello  ')).toBe('hello');
    });

    it('handles special characters', () => {
      expect(utils.slugify('foo@bar.baz')).toBe('foo-bar-baz');
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(utils.capitalize('hello')).toBe('Hello');
    });

    it('returns empty string for empty input', () => {
      expect(utils.capitalize('')).toBe('');
    });

    it('handles already capitalized', () => {
      expect(utils.capitalize('Hello')).toBe('Hello');
    });
  });

  describe('escapeMarkdown', () => {
    it('escapes asterisks', () => {
      expect(utils.escapeMarkdown('**bold**')).toContain('\\*');
    });

    it('escapes underscores', () => {
      expect(utils.escapeMarkdown('_italic_')).toContain('\\_');
    });

    it('returns string for non-string input', () => {
      expect(() => utils.escapeMarkdown(42)).not.toThrow();
    });
  });
});

// ─── scanner.js ──────────────────────────────────────────────────────────────
describe('scanner.js', () => {
  let scanner;

  beforeEach(() => {
    delete require.cache[require.resolve('../lib/scanner.js')];
    scanner = require('../lib/scanner.js');
  });

  describe('detectFrameworks', () => {
    it('detects express', () => {
      const pkg = { dependencies: { express: '^4.0.0' } };
      expect(scanner.detectFrameworks(pkg)).toContain('Express.js');
    });

    it('detects react', () => {
      const pkg = { dependencies: { react: '^18.0.0' } };
      expect(scanner.detectFrameworks(pkg)).toContain('React');
    });

    it('detects devDependencies', () => {
      const pkg = { devDependencies: { jest: '^29.0.0' } };
      expect(scanner.detectFrameworks(pkg)).toContain('Jest');
    });

    it('returns empty array for no known frameworks', () => {
      const pkg = { dependencies: { lodash: '^4.0.0' } };
      expect(scanner.detectFrameworks(pkg)).toEqual([]);
    });

    it('handles empty pkg', () => {
      expect(scanner.detectFrameworks({})).toEqual([]);
    });
  });

  describe('countFiles', () => {
    it('returns a number', () => {
      const count = scanner.countFiles(path.join(__dirname, '..'));
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('returns 0 for non-existent directory', () => {
      expect(scanner.countFiles('/nonexistent/path/xyz')).toBe(0);
    });
  });

  describe('findEntryPoint', () => {
    it('returns null for empty directory', () => {
      const result = scanner.findEntryPoint('/nonexistent/path', {});
      expect(result).toBeNull();
    });

    it('finds index.js in real project', () => {
      const result = scanner.findEntryPoint(path.join(__dirname, '..'), {});
      expect(result).toBe('index.js');
    });
  });

  describe('detectLicense', () => {
    it('returns license from pkg', () => {
      expect(scanner.detectLicense('/any', { license: 'MIT' })).toBe('MIT');
    });

    it('returns null when no license', () => {
      expect(scanner.detectLicense('/nonexistent/path', {})).toBeNull();
    });
  });

  describe('scanProject', () => {
    it('returns project data for current project', async () => {
      const data = await scanner.scanProject(path.join(__dirname, '..'));
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('frameworks');
      expect(data).toHaveProperty('fileCount');
      expect(data).toHaveProperty('entryPoint');
      expect(Array.isArray(data.frameworks)).toBe(true);
    });

    it('handles missing package.json gracefully', async () => {
      const data = await scanner.scanProject('/tmp');
      expect(data).toHaveProperty('name');
      expect(data.frameworks).toEqual([]);
    });
  });
});

// ─── generator.js ────────────────────────────────────────────────────────────
describe('generator.js', () => {
  let generator;

  beforeEach(() => {
    delete require.cache[require.resolve('../lib/generator.js')];
    delete require.cache[require.resolve('../lib/utils.js')];
    generator = require('../lib/generator.js');
  });

  const sampleData = {
    name: 'my-project',
    version: '1.2.3',
    description: 'A test project',
    author: 'Test Author',
    license: 'MIT',
    frameworks: ['Express.js', 'React'],
    entryPoint: 'index.js',
    directories: ['src', 'tests'],
    fileCount: 42,
    scripts: { test: 'vitest', build: 'tsc' },
    keywords: ['test'],
    repository: null,
    homepage: null,
    engines: { node: '>=14.0.0' },
    bin: { 'my-project': 'index.js' },
    isCLI: true,
    deps: ['express'],
    devDeps: ['vitest'],
    pkg: {},
  };

  describe('generateBanner', () => {
    it('returns a string', () => {
      expect(typeof generator.generateBanner('test')).toBe('string');
    });

    it('contains the project name', () => {
      const banner = generator.generateBanner('myproject');
      expect(banner.toUpperCase()).toContain('MYPROJECT');
    });
  });

  describe('generateBadges', () => {
    it('returns a string', () => {
      expect(typeof generator.generateBadges(sampleData)).toBe('string');
    });

    it('includes version badge', () => {
      const badges = generator.generateBadges(sampleData);
      expect(badges).toContain('1.2.3');
    });

    it('includes license badge', () => {
      const badges = generator.generateBadges(sampleData);
      expect(badges).toContain('MIT');
    });

    it('includes framework badges', () => {
      const badges = generator.generateBadges(sampleData);
      expect(badges).toContain('Express.js');
    });
  });

  describe('generateInstallation', () => {
    it('returns a string with npm install', () => {
      const section = generator.generateInstallation(sampleData);
      expect(section).toContain('npm install');
    });

    it('includes -g flag for CLI projects', () => {
      const section = generator.generateInstallation({ ...sampleData, isCLI: true });
      expect(section).toContain('-g');
    });

    it('omits -g flag for library projects', () => {
      const section = generator.generateInstallation({ ...sampleData, isCLI: false });
      expect(section).not.toContain('-g');
    });
  });

  describe('generateScripts', () => {
    it('returns empty string for no scripts', () => {
      expect(generator.generateScripts({})).toBe('');
    });

    it('includes script names', () => {
      const section = generator.generateScripts({ test: 'vitest', build: 'tsc' });
      expect(section).toContain('test');
      expect(section).toContain('build');
    });
  });

  describe('generateReadme', () => {
    it('returns a non-empty string', () => {
      const readme = generator.generateReadme(sampleData);
      expect(typeof readme).toBe('string');
      expect(readme.length).toBeGreaterThan(100);
    });

    it('contains project name', () => {
      const readme = generator.generateReadme(sampleData);
      expect(readme).toContain('my-project');
    });

    it('contains description', () => {
      const readme = generator.generateReadme(sampleData);
      expect(readme).toContain('A test project');
    });

    it('contains installation section', () => {
      const readme = generator.generateReadme(sampleData);
      expect(readme).toContain('## Installation');
    });

    it('contains usage section', () => {
      const readme = generator.generateReadme(sampleData);
      expect(readme).toContain('## Usage');
    });

    it('contains contributing section', () => {
      const readme = generator.generateReadme(sampleData);
      expect(readme).toContain('## Contributing');
    });

    it('contains license section', () => {
      const readme = generator.generateReadme(sampleData);
      expect(readme).toContain('## License');
    });
  });
});
