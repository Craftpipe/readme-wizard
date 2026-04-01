// tests/utils.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log } from '../lib/utils.js';

describe('log', () => {
  let stderrSpy;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it('writes to stderr', () => {
    log('info', 'hello world');
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('includes the message in output', () => {
    log('info', 'test message');
    const output = stderrSpy.mock.calls[0][0];
    expect(output).toContain('test message');
  });

  it('includes INFO label for info level', () => {
    log('info', 'msg');
    const output = stderrSpy.mock.calls[0][0];
    expect(output).toContain('INFO');
  });

  it('includes WARN label for warn level', () => {
    log('warn', 'msg');
    const output = stderrSpy.mock.calls[0][0];
    expect(output).toContain('WARN');
  });

  it('includes ERROR label for error level', () => {
    log('error', 'msg');
    const output = stderrSpy.mock.calls[0][0];
    expect(output).toContain('ERROR');
  });

  it('includes SUCCESS label for success level', () => {
    log('success', 'msg');
    const output = stderrSpy.mock.calls[0][0];
    expect(output).toContain('SUCCESS');
  });

  it('handles unknown level gracefully', () => {
    expect(() => log('unknown', 'msg')).not.toThrow();
  });

  it('handles empty message', () => {
    expect(() => log('info', '')).not.toThrow();
    const output = stderrSpy.mock.calls[0][0];
    expect(output).toContain('INFO');
  });

  it('handles multiline messages', () => {
    log('info', 'line1\nline2');
    const output = stderrSpy.mock.calls[0][0];
    expect(output).toContain('line1');
  });
});
