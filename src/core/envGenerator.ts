import { EnvLine } from "./envParser.js";

/**
 * Generates .env.example content from parsed EnvLines.
 * Values are stripped, but comments and structure are preserved.
 */
export function generateExample(lines: EnvLine[]): string {
  return lines
    .map((line) => {
      if (!line.key) return line.raw;
      return `${line.key}=`;
    })
    .join("\n");
}
