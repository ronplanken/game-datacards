import { describe, it, expect } from "vitest";
import { formatFileSize } from "../generic.helpers";

describe("formatFileSize", () => {
  it("reports small files in bytes", () => {
    expect(formatFileSize(0)).toBe("0 bytes");
    expect(formatFileSize(1023)).toBe("1023 bytes");
  });

  it("switches to KB at a kilobyte and MB at a megabyte", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1048575)).toBe("1024 KB");
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(2202010)).toBe("2.1 MB");
  });

  it("says nothing when the size is unknown", () => {
    expect(formatFileSize(undefined)).toBe("");
    expect(formatFileSize(null)).toBe("");
    expect(formatFileSize(NaN)).toBe("");
  });
});
