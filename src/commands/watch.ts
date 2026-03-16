import pc from "picocolors";
import { ensureGitignore } from "../utils/git.js";
import { startWatcher } from "../core/envWatcher.js";

export async function watchCommand() {
  try {
    await ensureGitignore();
    await startWatcher();
    return { success: true };
  } catch (error) {
    console.error(pc.red("✖ Watcher error:"), error);
    return { success: false };
  }
}
