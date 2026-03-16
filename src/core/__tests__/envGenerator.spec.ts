import { describe, it, expect } from "vitest";
import { generateExample } from "../envGenerator.js";
import { EnvLine } from "../envParser.js";

describe("envGenerator", () => {
  it("should generate empty values for keys", () => {
    const lines: EnvLine[] = [
      { key: "PORT", value: "3000", raw: "PORT=3000" },
      { key: "DB", value: "url", raw: "DB=url" },
    ];
    const result = generateExample(lines);
    expect(result).toBe("PORT=\nDB=");
  });

  it("should preserve comments and empty lines", () => {
    const lines: EnvLine[] = [
      { key: "", value: "", raw: "# Comment" },
      { key: "", value: "", raw: "" },
      { key: "PORT", value: "3000", raw: "PORT=3000" },
    ];
    const result = generateExample(lines);
    expect(result).toBe("# Comment\n\nPORT=");
  });
});
