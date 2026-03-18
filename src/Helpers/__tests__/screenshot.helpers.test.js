import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockHtml2canvas } = vi.hoisted(() => ({
  mockHtml2canvas: vi.fn(),
}));
vi.mock("html2canvas", () => ({
  default: mockHtml2canvas,
}));

import { captureToBlob, captureToDataUrl } from "../screenshot.helpers";

describe("screenshot.helpers", () => {
  const mockElement = document.createElement("div");
  const mockBlob = new Blob(["test"], { type: "image/png" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("captureToBlob", () => {
    it("calls html2canvas with default scale 1.5 and returns PNG blob", async () => {
      const mockCanvas = { toBlob: vi.fn((cb) => cb(mockBlob)) };
      mockHtml2canvas.mockResolvedValue(mockCanvas);

      const result = await captureToBlob(mockElement);

      expect(mockHtml2canvas).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({ scale: 1.5, useCORS: true, logging: false }),
      );
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), "image/png");
      expect(result).toBe(mockBlob);
    });

    it("calls html2canvas with custom scale", async () => {
      const mockCanvas = { toBlob: vi.fn((cb) => cb(mockBlob)) };
      mockHtml2canvas.mockResolvedValue(mockCanvas);

      await captureToBlob(mockElement, { scale: 2.5 });

      expect(mockHtml2canvas).toHaveBeenCalledWith(mockElement, expect.objectContaining({ scale: 2.5 }));
    });
  });

  describe("captureToDataUrl", () => {
    it("calls html2canvas with scale 1 and returns data URL", async () => {
      const mockDataUrl = "data:image/png;base64,abc123";
      const mockCanvas = { toDataURL: vi.fn(() => mockDataUrl) };
      mockHtml2canvas.mockResolvedValue(mockCanvas);

      const result = await captureToDataUrl(mockElement);

      expect(mockHtml2canvas).toHaveBeenCalledWith(mockElement, expect.objectContaining({ scale: 1 }));
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/png");
      expect(result).toBe(mockDataUrl);
    });
  });
});
