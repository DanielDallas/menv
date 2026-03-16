import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";

const ENV_PATTERNS = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  "node_modules",
  "dist",
  "!.env.example",
  "!.env.sample",
];

const SECTION_HEADER = "# Menv: Environment file protection";

/**
 * Ensures that .env files are present in .gitignore.
 * Creates .gitignore if it doesn't exist.
 */
export async function ensureGitignore() {
  const gitignorePath = path.resolve(process.cwd(), ".gitignore");

  try {
    let content = "";
    let exists = false;

    try {
      content = await fs.readFile(gitignorePath, "utf8");
      exists = true;
    } catch {
      // File doesn't exist, we'll create it
    }

    const lines = content.split("\n").map((l) => l.trim());
    const missingPatterns = ENV_PATTERNS.filter((p) => !lines.includes(p));

    if (missingPatterns.length === 0) {
      return;
    }

    console.log(pc.dim("Updating .gitignore to protect environment files..."));

    let newContent = content;
    if (exists && content.length > 0 && !content.endsWith("\n")) {
      newContent += "\n";
    }

    if (!content.includes(SECTION_HEADER)) {
      newContent += `\n${SECTION_HEADER}\n`;
    }

    for (const pattern of missingPatterns) {
      newContent += `${pattern}\n`;
    }

    await fs.writeFile(gitignorePath, newContent);
  } catch (error) {
    // We don't want to crash the tool if .gitignore update fails,
    // but we should warn the user.
    console.warn(
      pc.yellow(
        "⚠ Warning: Could not update .gitignore. Please ensure your .env files are ignored manually.",
      ),
    );
  }
}
