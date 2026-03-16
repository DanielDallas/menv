import { EnvLine } from "./envParser.js";

export interface SyncResult {
  missingInExample: string[];
  missingInEnv: string[];
}

/**
 * Compares keys between .env and .env.example.
 */
export function compareEnvKeys(
  envLines: EnvLine[],
  exampleLines: EnvLine[],
): SyncResult {
  const envKeys = new Set(envLines.map((l) => l.key).filter(Boolean));
  const exampleKeys = new Set(exampleLines.map((l) => l.key).filter(Boolean));

  return {
    missingInExample: Array.from(envKeys).filter((k) => !exampleKeys.has(k)),
    missingInEnv: Array.from(exampleKeys).filter((k) => !envKeys.has(k)),
  };
}
