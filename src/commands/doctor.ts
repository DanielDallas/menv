import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import { parseEnv } from "../core/envParser.js";
import { scanSecrets } from "../core/secretScanner.js";

export async function doctorCommand() {
  try {
    const files = await fs.readdir(process.cwd());
    const envFiles = files.filter(
      (f) =>
        f.startsWith(".env") &&
        !f.endsWith(".example") &&
        !f.endsWith(".sample"),
    );

    if (envFiles.length === 0) {
      console.log(pc.dim("No environment files found to scan."));
      return { success: true };
    }

    let totalIssues = 0;

    for (const file of envFiles) {
      const filePath = path.resolve(process.cwd(), file);
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
      console.log(
        pc.green(
          `✔ No potential secrets detected across ${envFiles.length} files.`,
        ),
      );
    } else {
      console.log(pc.red(`\n✖ Total issues found: ${totalIssues}`));
    }
    return { success: totalIssues === 0 };
  } catch (error) {
    console.error(pc.red("✖ Doctor error:"), error);
    return { success: false };
  }
}
