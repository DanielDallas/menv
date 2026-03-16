#!/usr/bin/env node
import { cac } from "cac";
import pc from "picocolors";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };
import { parseEnv } from "./core/envParser.js";
import { generateExample } from "./core/envGenerator.js";
import { compareEnvKeys } from "./core/envValidator.js";
import { startWatcher } from "./core/envWatcher.js";
import { scanSecrets } from "./core/secretScanner.js";
import { ensureGitignore } from "./utils/git.js";
import { findTemplateFile, findEnvFile } from "./utils/template.js";

const cli = cac("menv");

cli
  .command("generate", "Generate .env.example from environment file")
  .action(async () => {
    try {
      await ensureGitignore();
      const envPath = await findEnvFile();
      const examplePath = path.resolve(process.cwd(), ".env.example");

      if (!envPath) {
        console.error(
          pc.red(
            "✖ No environment file (.env, .env.local, etc.) found in current directory.",
          ),
        );
        process.exit(1);
      }

      const envName = path.basename(envPath);
      const content = await fs.readFile(envPath, "utf8");
      const parsed = parseEnv(content);
      const generated = generateExample(parsed);

      await fs.writeFile(examplePath, generated);
      console.log(
        pc.green(`✔ .env.example generated successfully from ${envName}.`),
      );
    } catch (error) {
      console.error(pc.red("✖ Failed to generate .env.example:"), error);
      process.exit(1);
    }
  });

cli
  .command("sync", "Check for inconsistencies between environment and template")
  .action(async () => {
    try {
      const envPath = await findEnvFile();
      const templatePath = await findTemplateFile();

      if (!envPath) {
        console.error(pc.red("✖ No environment file found."));
        process.exit(1);
      }

      if (!templatePath) {
        console.error(
          pc.red(
            "✖ No environment template (.env.example or .env.sample) found.",
          ),
        );
        process.exit(1);
      }

      const envName = path.basename(envPath);
      const templateName = path.basename(templatePath);
      console.log(pc.dim(`\nComparing ${envName} with ${templateName}...`));

      const envContent = await fs.readFile(envPath, "utf8");
      const templateContent = await fs.readFile(templatePath, "utf8");

      const envParsed = parseEnv(envContent);
      const templateParsed = parseEnv(templateContent);

      const { missingInExample: missingInTemplate, missingInEnv } =
        compareEnvKeys(envParsed, templateParsed);

      if (missingInTemplate.length === 0 && missingInEnv.length === 0) {
        console.log(pc.green(`✔ ${templateName} is in sync with .env`));
        return;
      }

      if (missingInTemplate.length > 0) {
        console.log(pc.yellow(`\nMissing in ${templateName}:`));
        missingInTemplate.forEach((k) => console.log(pc.dim(` - ${k}`)));
      }

      if (missingInEnv.length > 0) {
        console.log(pc.yellow(`\nExtra in ${templateName} (not in .env):`));
        missingInEnv.forEach((k) => console.log(pc.dim(` - ${k}`)));
      }
    } catch (error) {
      console.error(pc.red("✖ Failed to sync environment files:"), error);
      process.exit(1);
    }
  });

cli
  .command(
    "check",
    "Validate that all required variables in template exist in environment",
  )
  .action(async () => {
    try {
      const envPath = await findEnvFile();
      const templatePath = await findTemplateFile();

      if (!templatePath) {
        console.error(
          pc.red(
            "✖ No environment template (.env.example or .env.sample) found.",
          ),
        );
        process.exit(1);
      }

      const templateName = path.basename(templatePath);
      const envName = envPath ? path.basename(envPath) : ".env";
      console.log(pc.dim(`\nValidating ${envName} against ${templateName}...`));

      const envContent = envPath ? await fs.readFile(envPath, "utf8") : "";
      const templateContent = await fs.readFile(templatePath, "utf8");

      const envParsed = parseEnv(envContent);
      const exampleParsed = parseEnv(templateContent);

      const envKeys = new Set(envParsed.map((l) => l.key).filter(Boolean));
      const requiredKeys = exampleParsed.map((l) => l.key).filter(Boolean);

      let hasMissing = false;
      console.log(pc.bold("\nEnvironment Variable Check:"));

      for (const key of requiredKeys) {
        if (envKeys.has(key)) {
          console.log(`${pc.green("✔")} ${key}`);
        } else {
          console.log(`${pc.red("✖")} ${key} (missing)`);
          hasMissing = true;
        }
      }

      if (hasMissing) {
        console.error(
          pc.red(
            `\n✖ Environment validation failed. Please check ${templateName}.`,
          ),
        );
        process.exit(1);
      } else {
        console.log(pc.green("\n✔ Environment validation passed."));
      }
    } catch (error) {
      console.error(pc.red("✖ Validation error:"), error);
      process.exit(1);
    }
  });

cli
  .command(
    "watch",
    "Watch for environment changes and automatically update template",
  )
  .action(async () => {
    try {
      await ensureGitignore();
      await startWatcher();
    } catch (error) {
      console.error(pc.red("✖ Watcher error:"), error);
      process.exit(1);
    }
  });

cli
  .command("doctor", "Scan for potential secret leaks in environment files")
  .action(async () => {
    try {
      const files = [
        ".env",
        ".env.local",
        ".env.development",
        ".env.production",
      ];
      let totalIssues = 0;

      for (const file of files) {
        const filePath = path.resolve(process.cwd(), file);
        if (!(await fs.stat(filePath).catch(() => false))) continue;

        const content = await fs.readFile(filePath, "utf8");
        const parsed = parseEnv(content);
        const issues = scanSecrets(parsed);

        if (issues.length > 0) {
          console.log(
            pc.yellow(`\n⚠ Potential secrets found in ${pc.bold(file)}:`),
          );
          issues.forEach((issue) => {
            console.log(
              `${pc.dim(`Line ${issue.line}:`)} ${pc.red(issue.key)} (${issue.type})`,
            );
          });
          totalIssues += issues.length;
        }
      }

      if (totalIssues === 0) {
        console.log(pc.green("✔ No potential secrets detected."));
      } else {
        console.log(pc.red(`\n✖ Total issues found: ${totalIssues}`));
      }
    } catch (error) {
      console.error(pc.red("✖ Doctor error:"), error);
      process.exit(1);
    }
  });

cli.help();
cli.version(version);

cli.parse();
