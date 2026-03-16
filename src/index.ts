#!/usr/bin/env node
import { cac } from "cac";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

import { generateCommand } from "./commands/generate.js";
import { syncCommand } from "./commands/sync.js";
import { checkCommand } from "./commands/check.js";
import { watchCommand } from "./commands/watch.js";
import { doctorCommand } from "./commands/doctor.js";

const cli = cac("menv");

cli
  .command("generate", "Generate .env.example from environment file")
  .option("-e, --env <file>", "Path to environment file")
  .option("--scan", "Scan source files for process.env references")
  .option("--dir <dir>", "Directory to scan (default: current directory)")
  .option("--comment", "Add source location as a comment above each key")
  .action(async (options) => {
    const result = await generateCommand(options);
    if (!result.success) process.exit(1);
  });

cli
  .command("sync", "Check for inconsistencies between environment and template")
  .option("-e, --env <file>", "Path to environment file")
  .option("-t, --template <file>", "Path to template file")
  .option("--format <format>", "Output format (text, json)")
  .action(async (options) => {
    const result = await syncCommand(options);
    if (!result.success) process.exit(1);
  });

cli
  .command(
    "check",
    "Validate that all required variables in template exist in environment",
  )
  .option("-e, --env <file>", "Path to environment file")
  .option("-t, --template <file>", "Path to template file")
  .option("--format <format>", "Output format (text, json)")
  .action(async (options) => {
    const result = await checkCommand(options);
    if (!result.success) process.exit(1);
  });

cli
  .command(
    "watch",
    "Watch for environment changes and automatically update template",
  )
  .action(async () => {
    const result = await watchCommand();
    if (!result.success) process.exit(1);
  });

cli
  .command("doctor", "Scan for potential secret leaks in environment files")
  .action(async () => {
    const result = await doctorCommand();
    if (!result.success) process.exit(1);
  });

cli.help();
cli.version(version);

cli.parse();
