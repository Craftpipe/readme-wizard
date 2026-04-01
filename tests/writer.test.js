import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { writeOutput } from '../lib/writer.js';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'readme-wizard-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('writeOutput()', () => {
  it('writes content to a new file', async () => {
    const outPath = path.join(tmpDir, 'README.md');
    await writeOutput(outPath, '# Hello', { force: false });
    expect(fs.existsSync(outPath)).toBe(true);
    expect(fs.readFileSync(outPath, 'utf8')).toBe('# Hello');
  });

  it('throws when file exists and force is false', async () => {
    const outPath = path.join(tmpDir, 'README.md');
    fs.writeFileSync(outPath, 'existing content', 'utf8');
    await expect(writeOutput(outPath, '# New', { force: false })).rejects.toThrow();
  });

  it('overwrites when force is true', async () => {
    const outPath = path.join(tmpDir, 'README.md');
    fs.writeFileSync(outPath, 'old content', 'utf8');
    await writeOutput(outPath, '# New Content', { force: true });
    expect(fs.readFileSync(outPath, 'utf8')).toBe('# New Content');
  });

  it('creates nested directories if they do not exist', async () => {
    const outPath = path.join(tmpDir, 'nested', 'deep', 'README.md');
    await writeOutput(outPath, '# Nested', { force: false });
    expect(fs.existsSync(outPath)).toBe(true);
  });

  it('writes empty string without error', async () => {
    const outPath = path.join(tmpDir, 'empty.md');
    await writeOutput(outPath, '', { force: false });
    expect(fs.readFileSync(outPath, 'utf8')).toBe('');
  });

  it('writes large content without error', async () => {
    const outPath = path.join(tmpDir, 'large.md');
    const content = '# Line\n'.repeat(10000);
    await writeOutput(outPath, content, { force: false });
    expect(fs.readFileSync(outPath, 'utf8')).toBe(content);
  });
});
