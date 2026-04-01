import { describe, it, expect } from 'vitest';
import { execSync, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CLI = path.resolve(__dirname, '../index.js');

describe('CLI integration', () => {
  it('exits 0 with --dry-run', () => {
    const result = spawnSync(process.execPath, [CLI, '--dry-run'], {
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..'),
    });
    expect(result.status).toBe(0);
  });

  it('--dry-run outputs markdown content', () => {
    const result = spawnSync(process.execPath, [CLI, '--dry-run'], {
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..'),
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('#');
  });

  it('--dry-run output contains project name', () => {
    const result = spawnSync(process.execPath, [CLI, '--dry-run'], {
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..'),
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('readme-wizard');
  });

  it('writes README to temp dir', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rwtest-'));
    // Copy package.json to temp dir so scanner has something to read
    fs.copyFileSync(
      path.resolve(__dirname, '../package.json'),
      path.join(tmpDir, 'package.json')
    );
    const result = spawnSync(process.execPath, [CLI, '--force', '--cwd', tmpDir], {
      encoding: 'utf8',
      cwd: tmpDir,
    });
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, 'README.md'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('exits 0 with no arguments', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rwtest-'));
    fs.copyFileSync(
      path.resolve(__dirname, '../package.json'),
      path.join(tmpDir, 'package.json')
    );
    const result = spawnSync(process.execPath, [CLI], {
      encoding: 'utf8',
      cwd: tmpDir,
    });
    expect(result.status).toBe(0);
    fs.rmSync(tmpDir, { recursive: true });
  });
});
