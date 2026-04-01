# readme-wizard

A CLI tool that generates beautiful, comprehensive README files by scanning your codebase. Detects frameworks, finds entry points, analyzes project structure, and assembles a polished markdown file with badges, installation steps, usage examples, and contributing guidelines — all without internet access.

## What It Does

- **Scans your project** — reads package.json, detects dependencies and frameworks
- **Analyzes structure** — finds entry points, counts files, identifies key directories
- **Generates README** — creates a well-formatted markdown file with:
  - ASCII art headers
  - shields.io badge suggestions
  - Installation instructions
  - Usage examples
  - API reference (if applicable)
  - Contributing guidelines
  - License information

## Installation

```bash
npm install -g readme-wizard
```

Or use directly with npx:

```bash
npx readme-wizard
```

## Usage

Navigate to your project directory and run:

```bash
readme-wizard
```

The tool will scan your project and generate a `README.md` file in the current directory.

### Options

```bash
readme-wizard --output custom-name.md    # Specify output filename
readme-wizard --force                    # Overwrite existing README
readme-wizard --verbose                  # Show detailed scan results
```

## Examples

**Basic usage:**
```bash
cd my-project
readme-wizard
```

**Generate with custom output:**
```bash
readme-wizard --output docs/README.md
```

**Preview before writing:**
```bash
readme-wizard --verbose
```

## FAQ

**Q: Does it require internet access?**  
A: No. readme-wizard works entirely offline and doesn't make any API calls.

**Q: Will it overwrite my existing README?**  
A: No, it will prompt you first. Use `--force` to skip the prompt.

**Q: What if my project structure is unusual?**  
A: The tool adapts to common patterns. Review the generated README and customize as needed.

**Q: Can I use it in CI/CD pipelines?**  
A: Yes. Use `--force` flag to skip interactive prompts.

**Q: Does it support monorepos?**  
A: Currently optimized for single-package projects. Monorepo support coming soon.

---

Built with AI by Craftpipe  
Support: support@heijnesdigital.com