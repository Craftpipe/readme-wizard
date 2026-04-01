// tests/generator.test.js
import { describe, it, expect } from 'vitest';
import { generateReadme, generateBadges, generateAsciiArt } from '../lib/generator.js';

describe('generateAsciiArt', () => {
  it('returns a string', () => {
    const result = generateAsciiArt('myapp');
    expect(typeof result).toBe('string');
  });

  it('contains the project name uppercased', () => {
    const result = generateAsciiArt('myapp');
    expect(result).toContain('MYAPP');
  });

  it('handles names with spaces', () => {
    const result = generateAsciiArt('my app');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('generateBadges', () => {
  it('returns empty string for empty data', () => {
    const result = generateBadges({});
    // Should still include PRs welcome badge
    expect(typeof result).toBe('string');
  });

  it('includes npm version badge when version present', () => {
    const result = generateBadges({ name: 'myapp', version: '1.0.0', frameworks: [] });
    expect(result).toContain('npm');
    expect(result).toContain('1.0.0');
  });

  it('includes license badge when license present', () => {
    const result = generateBadges({ name: 'myapp', license: 'MIT', frameworks: [] });
    expect(result).toContain('MIT');
  });

  it('includes framework badges for known frameworks', () => {
    const result = generateBadges({ frameworks: ['Express'] });
    expect(result).toContain('Express');
  });

  it('always includes PRs welcome badge', () => {
    const result = generateBadges({ frameworks: [] });
    expect(result).toContain('PRs');
  });

  it('includes node version badge when engines.node present', () => {
    const result = generateBadges({ frameworks: [], engines: { node: '>=16.0.0' } });
    expect(result).toContain('node');
  });
});

describe('generateReadme', () => {
  const minimalData = {
    name: 'test-project',
    description: 'A test project',
    version: '1.0.0',
    license: 'MIT',
    main: 'index.js',
    bin: {},
    scripts: { start: 'node index.js', test: 'vitest' },
    engines: { node: '>=14.0.0' },
    frameworks: ['Express', 'Jest'],
    dependencies: {},
    devDependencies: {},
    fileCount: 42,
    isNpmPackage: true,
    hasTests: true,
    directories: ['lib', 'tests'],
  };

  it('returns a non-empty string', () => {
    const result = generateReadme(minimalData);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(100);
  });

  it('contains the project name', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('test-project');
  });

  it('contains the description', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('A test project');
  });

  it('contains Installation section', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('## Installation');
  });

  it('contains Usage section', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('## Usage');
  });

  it('contains Contributing section', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('## Contributing');
  });

  it('contains License section when license provided', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('## License');
    expect(result).toContain('MIT');
  });

  it('contains Scripts section when scripts provided', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('## Scripts');
  });

  it('contains badges', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('shields.io');
  });

  it('contains table of contents', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('## Table of Contents');
  });

  it('handles missing optional fields gracefully', () => {
    const result = generateReadme({ name: 'bare', frameworks: [] });
    expect(typeof result).toBe('string');
    expect(result).toContain('bare');
  });

  it('does not contain License section when no license', () => {
    const data = { ...minimalData, license: '' };
    const result = generateReadme(data);
    expect(result).not.toContain('## License');
  });

  it('uses bin name in usage when bin is present', () => {
    const data = { ...minimalData, bin: { 'my-cli': 'index.js' } };
    const result = generateReadme(data);
    expect(result).toContain('my-cli');
  });

  it('shows git clone instructions for non-npm packages', () => {
    const data = { ...minimalData, isNpmPackage: false };
    const result = generateReadme(data);
    expect(result).toContain('git clone');
  });

  it('shows npm install for npm packages', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('npm install');
  });

  it('contains framework info when frameworks detected', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('Express');
  });

  it('contains file count when provided', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('42');
  });

  it('contains generated-by footer', () => {
    const result = generateReadme(minimalData);
    expect(result).toContain('readme-wizard');
  });
});
