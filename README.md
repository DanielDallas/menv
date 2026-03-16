# Menv NPM

Managed Environment Variables for Node.js projects.

<a href="https://menv.thedanieldallas.com" target="_blank">Official Website</a> // <a href="https://www.npmjs.com/package/menv-npm" target="_blank">npm Package</a>

Menv is a lightweight CLI designed to bring consistency, safety, and automation to environment variable management. It ensures that your development, production, and example environment files stay in sync while proactively protecting against accidental secret leaks.

## Features

- **Automated .env.example Generation**: Create and maintain example files that mirror your actual environment configuration without exposing sensitive values.
- **Environment Synchronization**: Detect and report inconsistencies between your local environment and documented templates.
- **CI-Ready Validation**: Validate that all required variables exist before deployment, preventing runtime crashes.
- **Real-time Watcher**: Automatically update your example files as you modify your local environment.
- **Security Scanning**: Detect potential secret leaks (AWS, Stripe, GitHub, etc.) within your environment files.
- **Auto-Protection**: Automatically ensures your environment files are added to .gitignore to prevent accidental commits.

## Installation

```bash
npm install -g menv-npm
```

## Quick Start

### 1. Just cloned a repo?

Bootstrap your project by discovering environment variables from the codebase:

```bash
menv generate --scan --comment
```

This scans your source files for `process.env` references and creates a documented `.env.example`.

### 2. Already have a .env?

Sync it with your example template:

```bash
menv sync
```

### 3. CI/CD Validation

Ensure all required variables are present before deployment:

```bash
menv check
```

## Commands

| Command    | Usage           | Description                                                      |
| ---------- | --------------- | ---------------------------------------------------------------- |
| `generate` | `menv generate` | Creates .env.example from .env or source code (`--scan`)         |
| `sync`     | `menv sync`     | Compares .env and .env.example (exits 1 on discrepancies)        |
| `check`    | `menv check`    | Validates that all variables in the example file exist locally   |
| `watch`    | `menv watch`    | Monitors .env for changes and updates the example file           |
| `doctor`   | `menv doctor`   | Scans all environment files (`.env*`) for potential secret leaks |

### Key Options

- `--scan`: Discover variables from source files (supports `.js`, `.ts`, `.tsx`, etc.)
- `--env <file>`: Override the automatic environment file discovery.
- `--template <file>`: Specify a custom template file path.
- `--format json`: Machine-readable output for `sync` and `check`.
- `--comment`: (with `--scan`) Adds source location as a comment above each key.

## Community

| Documentation                         | Description                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| [Contributing](CONTRIBUTING.md)       | Learn how to get started with contributing                                    |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Our standards for a healthy community                                         |
| [Security](SECURITY.md)               | Procedures for reporting security issues                                      |
| [License](LICENSE)                    | MIT Open Source License by [TheDanielDallas.com](https://thedanieldallas.com) |
