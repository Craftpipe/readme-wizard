// lib/generator.js
'use strict';

/**
 * Generates a README markdown string from scanned project data.
 */

function generateBadges(data) {
  const badges = [];

  if (data.version) {
    badges.push(`[![npm version](https://img.shields.io/badge/npm-v${data.version}-blue)](https://www.npmjs.com/package/${data.name})`);
  }

  if (data.engines && data.engines.node) {
    const nodeVer = data.engines.node.replace(/[>=<^~]/g, '').trim();
    badges.push(`[![Node.js](https://img.shields.io/badge/node-%3E%3D${nodeVer}-brightgreen)](https://nodejs.org)`);
  }

  if (data.license) {
    badges.push(`[![License: ${data.license}](https://img.shields.io/badge/license-${encodeURIComponent(data.license)}-yellow)](./LICENSE)`);
  }

  const frameworkBadges = {
    express: '[![Framework](https://img.shields.io/badge/framework-Express.js-lightgrey)](https://expressjs.com)',
    react: '[![Frontend](https://img.shields.io/badge/frontend-React-61dafb)](https://reactjs.org)',
    vue: '[![Frontend](https://img.shields.io/badge/frontend-Vue.js-42b883)](https://vuejs.org)',
    angular: '[![Frontend](https://img.shields.io/badge/frontend-Angular-dd0031)](https://angular.io)',
    next: '[![Framework](https://img.shields.io/badge/framework-Next.js-black)](https://nextjs.org)',
    nuxt: '[![Framework](https://img.shields.io/badge/framework-Nuxt.js-00dc82)](https://nuxt.com)',
    fastify: '[![Framework](https://img.shields.io/badge/framework-Fastify-000000)](https://fastify.io)',
    koa: '[![Framework](https://img.shields.io/badge/framework-Koa-33333d)](https://koajs.com)',
    jest: '[![Tests](https://img.shields.io/badge/tests-Jest-C21325)](https://jestjs.io)',
    vitest: '[![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18)](https://vitest.dev)',
    mocha: '[![Tests](https://img.shields.io/badge/tests-Mocha-8D6748)](https://mochajs.org)',
    prisma: '[![Database](https://img.shields.io/badge/database-Prisma-2D3748)](https://www.prisma.io)',
    mongoose: '[![Database](https://img.shields.io/badge/database-MongoDB-47A248)](https://mongoosejs.com)',
    sequelize: '[![Database](https://img.shields.io/badge/database-Sequelize-52B0E7)](https://sequelize.org)',
    typescript: '[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org)',
  };

  for (const fw of (data.frameworks || [])) {
    const key = fw.toLowerCase();
    if (frameworkBadges[key]) {
      badges.push(frameworkBadges[key]);
    }
  }

  badges.push('[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](./CONTRIBUTING.md)');

  return badges.join('\n');
}

function generateAsciiArt(name) {
  // Simple block-letter style using safe characters
  const lines = [
    '+-' + '-'.repeat(name.length) + '-+',
    '|  ' + name.toUpperCase() + '  |',
    '+-' + '-'.repeat(name.length) + '-+',
  ];
  return lines.join('\n');
}

function generateInstallSection(data) {
  const lines = [];
  lines.push('## Installation');
  lines.push('');

  if (data.isNpmPackage) {
    lines.push('```bash');
    lines.push(`npm install ${data.name}`);
    lines.push('```');
    lines.push('');
    lines.push('Or with yarn:');
    lines.push('');
    lines.push('```bash');
    lines.push(`yarn add ${data.name}`);
    lines.push('```');
  } else {
    lines.push('```bash');
    lines.push(`git clone <repository-url>`);
    lines.push(`cd ${data.name}`);
    lines.push('npm install');
    lines.push('```');
  }

  return lines.join('\n');
}

function generateUsageSection(data) {
  const lines = [];
  lines.push('## Usage');
  lines.push('');

  if (data.bin && Object.keys(data.bin).length > 0) {
    const binName = Object.keys(data.bin)[0];
    lines.push('```bash');
    lines.push(`${binName} [options]`);
    lines.push('```');
  } else if (data.scripts && data.scripts.start) {
    lines.push('```bash');
    lines.push('npm start');
    lines.push('```');
  } else if (data.main) {
    lines.push('```bash');
    lines.push(`node ${data.main}`);
    lines.push('```');
  } else {
    lines.push('```bash');
    lines.push('npm start');
    lines.push('```');
  }

  return lines.join('\n');
}

function generateScriptsSection(data) {
  if (!data.scripts || Object.keys(data.scripts).length === 0) {
    return '';
  }

  const lines = [];
  lines.push('## Scripts');
  lines.push('');
  lines.push('| Command | Description |');
  lines.push('|---------|-------------|');

  const scriptDescriptions = {
    start: 'Start the application',
    dev: 'Start in development mode',
    build: 'Build for production',
    test: 'Run tests',
    lint: 'Lint source files',
    format: 'Format source files',
    clean: 'Clean build artifacts',
    deploy: 'Deploy the application',
  };

  for (const [name, cmd] of Object.entries(data.scripts)) {
    const desc = scriptDescriptions[name] || `Run \`${cmd}\``;
    lines.push(`| \`npm run ${name}\` | ${desc} |`);
  }

  return lines.join('\n');
}

function generateContributing() {
  return [
    '## Contributing',
    '',
    'Contributions are welcome! Please follow these steps:',
    '',
    '1. Fork the repository',
    '2. Create a feature branch (`git checkout -b feature/amazing-feature`)',
    '3. Commit your changes (`git commit -m \'Add amazing feature\''  + '`)',
    '4. Push to the branch (`git push origin feature/amazing-feature`)',
    '5. Open a Pull Request',
    '',
    'Please make sure to update tests as appropriate.',
  ].join('\n');
}

function generateLicense(license) {
  if (!license) return '';
  return [
    '## License',
    '',
    `This project is licensed under the **${license}** license. See the [LICENSE](./LICENSE) file for details.`,
  ].join('\n');
}

function generateReadme(data) {
  const name = data.name || 'my-project';
  const description = data.description || 'A Node.js project.';

  const sections = [];

  // ASCII art header
  sections.push('```');
  sections.push(generateAsciiArt(name));
  sections.push('```');
  sections.push('');

  // Title and description
  sections.push(`# ${name}`);
  sections.push('');
  sections.push(`> ${description}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Badges
  const badges = generateBadges(data);
  if (badges) {
    sections.push(badges);
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  // Table of contents
  sections.push('## Table of Contents');
  sections.push('');
  sections.push('- [Installation](#installation)');
  sections.push('- [Usage](#usage)');
  if (data.scripts && Object.keys(data.scripts).length > 0) {
    sections.push('- [Scripts](#scripts)');
  }
  sections.push('- [Contributing](#contributing)');
  if (data.license) {
    sections.push('- [License](#license)');
  }
  sections.push('');

  // Overview
  sections.push('## Overview');
  sections.push('');
  sections.push(description);
  sections.push('');

  if (data.frameworks && data.frameworks.length > 0) {
    sections.push(`**Detected frameworks/libraries:** ${data.frameworks.join(', ')}`);
    sections.push('');
  }

  if (data.fileCount) {
    sections.push(`**Files scanned:** ${data.fileCount}`);
    sections.push('');
  }

  // Installation
  sections.push(generateInstallSection(data));
  sections.push('');

  // Usage
  sections.push(generateUsageSection(data));
  sections.push('');

  // Scripts
  const scriptsSection = generateScriptsSection(data);
  if (scriptsSection) {
    sections.push(scriptsSection);
    sections.push('');
  }

  // Contributing
  sections.push(generateContributing());
  sections.push('');

  // License
  const licenseSection = generateLicense(data.license);
  if (licenseSection) {
    sections.push(licenseSection);
    sections.push('');
  }

  // Footer
  sections.push('---');
  sections.push('');
  sections.push('*Generated by [readme-wizard](https://github.com/craftpipe/readme-wizard)*');

  return sections.join('\n');
}

module.exports = { generateReadme, generateBadges, generateAsciiArt };
