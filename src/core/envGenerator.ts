import { EnvLine } from "./envParser.js";
import { ScanResult } from "./sourceScanner.js";

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

/**
 * Generates .env content from source scan results.
 */
export function generateFromScan(
  results: ScanResult[],
  includeComments: boolean,
): string {
  return results
    .map((res) => {
      let output = "";
      if (includeComments && res.locations.length > 0) {
        const locations = res.locations
          .map((l) => `${l.file}:${l.line}`)
          .slice(0, 3); // Limit to 3 locations to keep it clean
        output += `# Found in: ${locations.join(", ")}${res.locations.length > 3 ? "..." : ""}\n`;
      }
      output += `${res.key}=`;
      return output;
    })
    .join("\n\n");
}
