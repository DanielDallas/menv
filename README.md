# Menv NPM

Managed Environment Variables for Node.js projects.

[Official Website](https://menv.thedanieldallas.com) // [npm Package](https://www.npmjs.com/package/menv-npm)

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
npm install menv-npm --save-dev
```

Generate your initial .env.example:

```bash
npx menv-npm generate
# or install globally: npm install -g menv-npm
```

Check if your environment is in sync:

```bash
npx menv-npm sync
```

Validate requirements for CI:

```bash
npx menv-npm check
```

## Commands

| Command    | Usage               | Description                                                    |
| ---------- | ------------------- | -------------------------------------------------------------- |
| `generate` | `menv-npm generate` | Creates or updates .env.example from .env                      |
| `sync`     | `menv-npm sync`     | Compares .env and .env.example for inconsistencies             |
| `check`    | `menv-npm check`    | Validates that all variables in the example file exist locally |
| `watch`    | `menv-npm watch`    | Monitors .env for changes and updates the example file         |
| `doctor`   | `menv-npm doctor`   | Scans all environment files for potential secret leaks         |

## Community

| Documentation                         | Description                                |
| ------------------------------------- | ------------------------------------------ |
| [Contributing](CONTRIBUTING.md)       | Learn how to get started with contributing |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Our standards for a healthy community      |
| [Security](SECURITY.md)               | Procedures for reporting security issues   |
| [License](LICENSE)                    | MIT Open Source License                    |
