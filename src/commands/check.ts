import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import { parseEnv } from "../core/envParser.js";
import { findEnvFile, findTemplateFile } from "../utils/template.js";

interface CheckOptions {
  env?: string;
  template?: string;
  format?: "text" | "json";
}

export async function checkCommand(options: CheckOptions) {
  try {
    const envPath = options.env
      ? path.resolve(process.cwd(), options.env)
      : await findEnvFile();
    const templatePath = options.template
      ? path.resolve(process.cwd(), options.template)
      : await findTemplateFile();

    if (!templatePath) {
      console.error(
        pc.red(
          "✖ No environment template (.env.example or .env.sample) found.",
        ),
      );
      return { success: false };
    }

    const templateName = path.basename(templatePath);
    const envName = envPath ? path.basename(envPath) : ".env";
    const isJson = options.format === "json";

    if (!isJson) {
      console.log(pc.dim(`\nValidating ${envName} against ${templateName}...`));
    }

    const envContent = envPath ? await fs.readFile(envPath, "utf8") : "";
    const templateContent = await fs.readFile(templatePath, "utf8");

    const envParsed = parseEnv(envContent);
    const exampleParsed = parseEnv(templateContent);

    const envKeys = new Set(envParsed.map((l) => l.key).filter(Boolean));
    const requiredKeys = exampleParsed.map((l) => l.key).filter(Boolean);

    let hasMissing = false;
    const results: Record<string, boolean> = {};

    if (!isJson) {
      console.log(pc.bold("\nEnvironment Variable Check:"));
    }

    for (const key of requiredKeys) {
      const exists = envKeys.has(key);
      results[key] = exists;
      if (!exists) {
        hasMissing = true;
      }

      if (!isJson) {
        if (exists) {
          console.log(`${pc.green("✔")} ${key}`);
        } else {
          console.log(`${pc.red("✖")} ${key} (missing)`);
        }
      }
    }

    if (isJson) {
      console.log(
        JSON.stringify(
          {
            status: hasMissing ? "failed" : "passed",
            variables: results,
          },
          null,
          2,
        ),
      );
    } else if (hasMissing) {
      console.error(
        pc.red(
          `\n✖ Environment validation failed. Please check ${templateName}.`,
        ),
      );
    } else {
      console.log(pc.green("\n✔ Environment validation passed."));
    }

    if (hasMissing) {
      return { success: false, missing: true };
    } else {
      return { success: true };
    }
  } catch (error) {
    if (options.format === "json") {
      console.log(
        JSON.stringify(
          {
            status: "error",
            message: error instanceof Error ? error.message : String(error),
          },
          null,
          2,
        ),
      );
    } else {
      console.error(pc.red("✖ Validation error:"), error);
    }
    return { success: false };
  }
}
