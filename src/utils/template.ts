import fs from "node:fs/promises";
import path from "node:path";

const ENV_VARIANTS = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
];
const TEMPLATE_VARIANTS = [".env.example", ".env.sample"];

/**
 * Finds the primary environment file in the current directory.
 * Priority: .env > .env.local > .env.development > .env.production
 * Excludes templates and test files.
 */
export async function findEnvFile(): Promise<string | null> {
  for (const variant of ENV_VARIANTS) {
    const filePath = path.resolve(process.cwd(), variant);
    if (await fs.stat(filePath).catch(() => false)) {
      return filePath;
    }
  }
  return null;
}

/**
 * Finds the environment template file in the current directory.
 * Returns the path to .env.example or .env.sample if found.
 */
export async function findTemplateFile(): Promise<string | null> {
  for (const variant of TEMPLATE_VARIANTS) {
    const filePath = path.resolve(process.cwd(), variant);
    if (await fs.stat(filePath).catch(() => false)) {
      return filePath;
    }
  }
  return null;
}
