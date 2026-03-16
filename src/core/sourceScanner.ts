import fs from "node:fs/promises";
import path from "node:path";

export interface ScanResult {
  key: string;
  locations: { file: string; line: number }[];
}

const DEFAULT_EXCLUDES = [
  "node_modules",
  "dist",
  ".next",
  "build",
  ".git",
  ".turbo",
  ".vercel",
];

const EXTENSIONS = [".ts", ".js", ".tsx", ".jsx", ".mjs", ".cjs"];

/**
 * Scans source files for process.env.VARIABLE_NAME or process.env['VARIABLE_NAME'] references.
 */
export async function scanSource(dir: string): Promise<ScanResult[]> {
  const results: Map<string, { file: string; line: number }[]> = new Map();
  const absoluteDir = path.resolve(process.cwd(), dir);

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(absoluteDir, fullPath);

      if (entry.isDirectory()) {
        if (DEFAULT_EXCLUDES.includes(entry.name)) continue;
        await walk(fullPath);
      } else if (entry.isFile()) {
        if (!EXTENSIONS.includes(path.extname(entry.name))) continue;

        const content = await fs.readFile(fullPath, "utf8");
        const lines = content.split("\n");

        lines.forEach((line, index) => {
          // Match process.env.VAR
          const dotMatches = line.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
          for (const match of dotMatches) {
            const key = match[1];
            addResult(key, relativePath, index + 1);
          }

          // Match process.env['VAR'] or process.env["VAR"]
          const bracketMatches = line.matchAll(
            /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
          );
          for (const match of bracketMatches) {
            const key = match[1];
            addResult(key, relativePath, index + 1);
          }

          // Warning for dynamic keys: process.env[dynamicVariable]
          if (line.includes("process.env[")) {
            // Simplified check: if it's process.env[ but not process.env[' or process.env["
            if (!/process\.env\[['"]/.test(line)) {
              // We won't warn for every single line but it's a good candidate for later improvement
            }
          }
        });
      }
    }
  }

  function addResult(key: string, file: string, line: number) {
    const locations = results.get(key) || [];
    locations.push({ file, line });
    results.set(key, locations);
  }

  await walk(absoluteDir);

  return Array.from(results.entries())
    .map(([key, locations]) => ({
      key,
      locations,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}
