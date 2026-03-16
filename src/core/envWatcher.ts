import chokidar from "chokidar";
import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import { parseEnv } from "./envParser.js";
import { generateExample } from "./envGenerator.js";
import { findEnvFile } from "../utils/template.js";

/**
 * Watches for changes in the primary environment file and regenerates .env.example.
 */
export async function startWatcher() {
  const envPath = await findEnvFile();
  if (!envPath) {
    throw new Error("No environment file found to watch.");
  }
  const envName = path.basename(envPath);
  const examplePath = path.resolve(process.cwd(), ".env.example");

  console.log(pc.dim(`Watching for changes in ${pc.cyan(envName)}...`));

  const watcher = chokidar.watch(envPath, {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("change", async () => {
    try {
      console.log(
        pc.blue(`⚡ ${envName} changed, regenerating .env.example...`),
      );

      const content = await fs.readFile(envPath, "utf8");
      const parsed = parseEnv(content);
      const generated = generateExample(parsed);

      await fs.writeFile(examplePath, generated);
      console.log(pc.green("✔ .env.example updated."));
    } catch (error) {
      console.error(
        pc.red("✖ Failed to update .env.example in watch mode:"),
        error,
      );
    }
  });

  return watcher;
}
