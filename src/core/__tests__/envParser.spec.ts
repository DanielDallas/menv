import { describe, it, expect } from "vitest";
import { parseEnv } from "../envParser.js";

describe("envParser", () => {
  it("should parse simple key-value pairs", () => {
    const content = "PORT=3000\nDATABASE_URL=postgres://localhost";
    const result = parseEnv(content);
    expect(result).toContainEqual(
      expect.objectContaining({ key: "PORT", value: "3000" }),
    );
    expect(result).toContainEqual(
      expect.objectContaining({
        key: "DATABASE_URL",
        value: "postgres://localhost",
      }),
    );
  });

  it("should handle comments and empty lines", () => {
    const content = "# Comment\n\nPORT=3000";
    const result = parseEnv(content);
    expect(result.filter((l) => l.key)).toHaveLength(1);
    expect(result[0].raw).toBe("# Comment");
    expect(result[1].raw).toBe("");
  });

  it("should handle quoted values", () => {
    const content = "SECRET=\"super secret\"\nKEY='single quoted'";
    const result = parseEnv(content);
    expect(result).toContainEqual(
      expect.objectContaining({ key: "SECRET", value: "super secret" }),
    );
    expect(result).toContainEqual(
      expect.objectContaining({ key: "KEY", value: "single quoted" }),
    );
  });
});
