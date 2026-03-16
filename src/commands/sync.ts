import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import { parseEnv } from "../core/envParser.js";
import { compareEnvKeys } from "../core/envValidator.js";
import { findEnvFile, findTemplateFile } from "../utils/template.js";

interface SyncOptions {
  env?: string;
  template?: string;
  format?: "text" | "json";
}

export async function syncCommand(options: SyncOptions) {
  try {
    const envPath = options.env
      ? path.resolve(process.cwd(), options.env)
      : await findEnvFile();
    const templatePath = options.template
      ? path.resolve(process.cwd(), options.template)
      : await findTemplateFile();

    if (!envPath) {
      console.error(pc.red("✖ No environment file found."));
      return { success: false };
    }

    if (!templatePath) {
      console.error(
        pc.red(
          "✖ No environment template (.env.example or .env.sample) found.",
        ),
      );
      return { success: false };
    }

    const envName = path.basename(envPath);
    const templateName = path.basename(templatePath);
    const isJson = options.format === "json";

    const envContent = await fs.readFile(envPath, "utf8");
    const templateContent = await fs.readFile(templatePath, "utf8");

    const envParsed = parseEnv(envContent);
    const templateParsed = parseEnv(templateContent);

    const { missingInExample: missingInTemplate, missingInEnv } =
      compareEnvKeys(envParsed, templateParsed);

    const isInSync =
      missingInTemplate.length === 0 && missingInEnv.length === 0;

    if (isJson) {
      console.log(
        JSON.stringify(
          {
            status: isInSync ? "sync" : "out-of-sync",
            missingInTemplate,
            missingInEnv,
          },
          null,
          2,
        ),
      );
    } else {
      if (isInSync) {
        console.log(pc.green(`✔ ${templateName} is in sync with ${envName}`));
      } else {
        if (missingInTemplate.length > 0) {
          console.log(pc.yellow(`\nMissing in ${templateName}:`));
          missingInTemplate.forEach((k) => console.log(pc.dim(` - ${k}`)));
        }

        if (missingInEnv.length > 0) {
          console.log(
            pc.yellow(`\nExtra in ${templateName} (not in ${envName}):`),
          );
          missingInEnv.forEach((k) => console.log(pc.dim(` - ${k}`)));
        }
      }
    }

    if (isInSync) {
      return { success: true };
    } else {
      return { success: false, discrepancies: true };
    }
  } catch (error) {
    console.error(pc.red("✖ Failed to sync environment files:"), error);
    return { success: false };
  }
}
