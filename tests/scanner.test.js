// tests/scanner.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { scanProject } from '../lib/scanner.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'readme-wizard-test-'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('scanProject', () => {
  it('returns default name from directory when no package.json', async () => {
    const emptyDir = fs.mkdtempSync(path.join(tmpDir, 'empty-'));
    const data = await scanProject(emptyDir);
    expect(data.name).toBe(path.basename(emptyDir));
  });

  it('reads name from package.json', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'pkg-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'my-pkg', version: '2.0.0' }));
    const data = await scanProject(dir);
    expect(data.name).toBe('my-pkg');
    expect(data.version).toBe('2.0.0');
  });

  it('reads description from package.json', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'desc-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x', description: 'Hello world' }));
    const data = await scanProject(dir);
    expect(data.description).toBe('Hello world');
  });

  it('detects express framework', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'express-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'app',
      dependencies: { express: '^4.0.0' },
    }));
    const data = await scanProject(dir);
    expect(data.frameworks).toContain('Express');
  });

  it('detects react framework', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'react-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'app',
      dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
    }));
    const data = await scanProject(dir);
    expect(data.frameworks).toContain('React');
  });

  it('detects jest in devDependencies', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'jest-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'app',
      devDependencies: { jest: '^29.0.0' },
    }));
    const data = await scanProject(dir);
    expect(data.frameworks).toContain('Jest');
  });

  it('reads license from package.json', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'lic-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x', license: 'Apache-2.0' }));
    const data = await scanProject(dir);
    expect(data.license).toBe('Apache-2.0');
  });

  it('reads scripts from package.json', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'scripts-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'x',
      scripts: { start: 'node index.js', test: 'jest' },
    }));
    const data = await scanProject(dir);
    expect(data.scripts.start).toBe('node index.js');
    expect(data.scripts.test).toBe('jest');
  });

  it('reads engines from package.json', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'engines-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'x',
      engines: { node: '>=16.0.0' },
    }));
    const data = await scanProject(dir);
    expect(data.engines.node).toBe('>=16.0.0');
  });

  it('reads bin from package.json', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'bin-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'x',
      bin: { mycli: './index.js' },
    }));
    const data = await scanProject(dir);
    expect(data.bin.mycli).toBe('./index.js');
  });

  it('counts files in directory', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'files-'));
    fs.writeFileSync(path.join(dir, 'a.js'), '');
    fs.writeFileSync(path.join(dir, 'b.js'), '');
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x' }));
    const data = await scanProject(dir);
    expect(data.fileCount).toBeGreaterThanOrEqual(3);
  });

  it('does not count node_modules files', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'nm-'));
    fs.mkdirSync(path.join(dir, 'node_modules'));
    fs.writeFileSync(path.join(dir, 'node_modules', 'dep.js'), '');
    fs.writeFileSync(path.join(dir, 'index.js'), '');
    const data = await scanProject(dir);
    expect(data.fileCount).toBe(1);
  });

  it('handles malformed package.json gracefully', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'bad-'));
    fs.writeFileSync(path.join(dir, 'package.json'), 'NOT JSON {{{');
    const data = await scanProject(dir);
    expect(data.name).toBe(path.basename(dir));
  });

  it('detects test directory', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'testdir-'));
    fs.mkdirSync(path.join(dir, 'test'));
    const data = await scanProject(dir);
    expect(data.hasTests).toBe(true);
  });

  it('lists top-level directories', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'dirs-'));
    fs.mkdirSync(path.join(dir, 'src'));
    fs.mkdirSync(path.join(dir, 'lib'));
    const data = await scanProject(dir);
    expect(data.directories).toContain('src');
    expect(data.directories).toContain('lib');
  });

  it('does not list node_modules in directories', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'nodirs-'));
    fs.mkdirSync(path.join(dir, 'node_modules'));
    fs.mkdirSync(path.join(dir, 'src'));
    const data = await scanProject(dir);
    expect(data.directories).not.toContain('node_modules');
    expect(data.directories).toContain('src');
  });

  it('returns isNpmPackage true when package.json exists', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'npm-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x' }));
    const data = await scanProject(dir);
    expect(data.isNpmPackage).toBe(true);
  });

  it('returns isNpmPackage false when no package.json', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'nonpm-'));
    const data = await scanProject(dir);
    expect(data.isNpmPackage).toBe(false);
  });

  it('detects multiple frameworks', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'multi-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'app',
      dependencies: { express: '*', react: '*' },
      devDependencies: { jest: '*', typescript: '*' },
    }));
    const data = await scanProject(dir);
    expect(data.frameworks).toContain('Express');
    expect(data.frameworks).toContain('React');
    expect(data.frameworks).toContain('Jest');
    expect(data.frameworks).toContain('TypeScript');
  });

  it('returns empty frameworks array for project with no known deps', async () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'nodeps-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'x',
      dependencies: { 'some-unknown-lib': '*' },
    }));
    const data = await scanProject(dir);
    expect(data.frameworks).toEqual([]);
  });
});
