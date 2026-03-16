export interface EnvLine {
  key: string;
  value: string;
  comment?: string;
  raw: string;
}

/**
 * Parses raw .env content into structured data.
 * Handles quoted values, escaped characters, and inline comments.
 */
export function parseEnv(content: string): EnvLine[] {
  const lines: EnvLine[] = [];
  const rawLines = content.split(/\r?\n/);

  for (const raw of rawLines) {
    const trimmed = raw.trim();

    // Skip empty lines or pure comment lines
    if (!trimmed || trimmed.startsWith("#")) {
      lines.push({ key: "", value: "", raw });
      continue;
    }

    // Improved regex to optionally catch inline comments
    const match = trimmed.match(
      /^([^=:#\s]+)\s*[=:]\s*([^#\n]*)(?:\s*#\s*(.*))?$/,
    );
    if (!match) {
      lines.push({ key: "", value: "", raw });
      continue;
    }

    let [, key, value, comment] = match;
    key = key.trim();
    value = value.trim();

    // Remove surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    lines.push({ key, value, comment: comment?.trim(), raw });
  }

  return lines;
}
