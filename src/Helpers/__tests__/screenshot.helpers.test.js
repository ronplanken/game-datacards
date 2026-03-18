import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockToBlob, mockToPng } = vi.hoisted(() => ({
  mockToBlob: vi.fn(),
  mockToPng: vi.fn(),
}));
vi.mock("@zumer/snapdom", () => ({
  snapdom: {
    toBlob: mockToBlob,
    toPng: mockToPng,
  },
}));

import { captureToBlob, captureToDataUrl } from "../screenshot.helpers";

describe("screenshot.helpers", () => {
  const mockElement = document.createElement("div");
  const mockBlob = new Blob(["test"], { type: "image/png" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("captureToBlob", () => {
    it("calls snapdom.toBlob with type png and default scale 1.5", async () => {
      mockToBlob.mockResolvedValue(mockBlob);

      const result = await captureToBlob(mockElement);

      expect(mockToBlob).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({ type: "png", scale: 1.5, embedFonts: true }),
      );
      expect(result).toBe(mockBlob);
    });

    it("calls snapdom.toBlob with custom scale", async () => {
      mockToBlob.mockResolvedValue(mockBlob);

      await captureToBlob(mockElement, { scale: 2.5 });

      expect(mockToBlob).toHaveBeenCalledWith(mockElement, expect.objectContaining({ type: "png", scale: 2.5 }));
    });

    it("passes svgCleanup, gridFix, and captureSvg plugins", async () => {
      mockToBlob.mockResolvedValue(mockBlob);

      await captureToBlob(mockElement);

      const opts = mockToBlob.mock.calls[0][1];
      expect(opts.plugins).toHaveLength(3);
      expect(opts.plugins[0].name).toBe("svg-cleanup");
      expect(opts.plugins[1].name).toBe("grid-fix");
      expect(opts.plugins[2].name).toBe("capture-svg");
    });

    it("throws when snapdom fails and no svgString was captured", async () => {
      mockToBlob.mockRejectedValue(new DOMException("Invalid encoded image data"));

      await expect(captureToBlob(mockElement)).rejects.toThrow("Failed to capture element as image");
    });
  });

  describe("captureToDataUrl", () => {
    it("calls snapdom.toPng with scale 1 and returns src data URL", async () => {
      const mockDataUrl = "data:image/png;base64,abc123";
      mockToPng.mockResolvedValue({ src: mockDataUrl });

      const result = await captureToDataUrl(mockElement);

      expect(mockToPng).toHaveBeenCalledWith(mockElement, expect.objectContaining({ scale: 1, embedFonts: true }));
      expect(result).toBe(mockDataUrl);
    });

    it("throws when snapdom fails and no svgString was captured", async () => {
      mockToPng.mockRejectedValue(new DOMException("Invalid encoded image data"));

      await expect(captureToDataUrl(mockElement)).rejects.toThrow("Failed to capture element as image");
    });
  });
});
