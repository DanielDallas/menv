import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import { parseEnv } from "../core/envParser.js";
import { generateExample, generateFromScan } from "../core/envGenerator.js";
import { ensureGitignore } from "../utils/git.js";
import { findEnvFile } from "../utils/template.js";
import { scanSource } from "../core/sourceScanner.js";

interface GenerateOptions {
  env?: string;
  scan?: boolean;
  dir?: string;
  comment?: boolean;
}

export async function generateCommand(options: GenerateOptions) {
  try {
    await ensureGitignore();

    const examplePath = path.resolve(process.cwd(), ".env.example");

    if (options.scan) {
      console.log(
        pc.dim(`Scanning source files in ${pc.bold(options.dir || "./")}...`),
      );
      const scanResults = await scanSource(options.dir || "./");

      if (scanResults.length === 0) {
        console.warn(
          pc.yellow("⚠ No process.env references found in source files."),
        );
        return { success: true };
      }

      const generated = generateFromScan(scanResults, !!options.comment);
      await fs.writeFile(examplePath, generated);

      console.log(
        pc.green(
          `✔ .env.example generated successfully from source (${scanResults.length} variables).`,
        ),
      );
      return { success: true };
    }

    const envPath = options.env
      ? path.resolve(process.cwd(), options.env)
      : await findEnvFile();

    if (!envPath) {
      console.error(
        pc.red(
          "✖ No environment file found. Use --env to specify one or --scan to discover from source.",
        ),
      );
      return { success: false };
    }

    const envName = path.basename(envPath);
    const content = await fs.readFile(envPath, "utf8");
    const parsed = parseEnv(content);
    const generated = generateExample(parsed);

    await fs.writeFile(examplePath, generated);
    console.log(
      pc.green(`✔ .env.example generated successfully from ${envName}.`),
    );
    return { success: true };
  } catch (error) {
    console.error(pc.red("✖ Failed to generate .env.example:"), error);
    return { success: false };
  }
}
