# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2024-05-01

### Fixed
- Mirror workflow now uses `x-access-token` auth and fallback push for branch name mismatch
- Added `menv-npm` binary alias alongside `menv`

## [0.1.1] - 2024-04-28

### Fixed
- Robust sync logic in mirror workflow
- README command examples updated

## [0.1.0] - 2024-04-20

### Added
- `generate` command: creates `.env.example` from `.env` by stripping values
- `sync` command: reports inconsistencies between `.env` and `.env.example`
- `check` command: validates all required template variables exist in local `.env`
- `watch` command: real-time file watcher that auto-regenerates `.env.example` on changes
- `doctor` command: scans environment files for potential secret leaks
- Auto-updates `.gitignore` with environment file protection patterns
- Secret scanner with patterns for AWS, Stripe, GitHub tokens, and private keys
