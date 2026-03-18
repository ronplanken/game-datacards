import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockToCanvas } = vi.hoisted(() => ({
  mockToCanvas: vi.fn(),
}));
vi.mock("@zumer/snapdom", () => ({
  snapdom: {
    toCanvas: mockToCanvas,
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
    it("calls snapdom.toCanvas with default scale 1.5", async () => {
      const mockCanvas = {
        toBlob: vi.fn((cb) => cb(mockBlob)),
      };
      mockToCanvas.mockResolvedValue(mockCanvas);

      const result = await captureToBlob(mockElement);

      expect(mockToCanvas).toHaveBeenCalledWith(mockElement, { scale: 1.5 });
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), "image/png");
      expect(result).toBe(mockBlob);
    });

    it("calls snapdom.toCanvas with custom scale", async () => {
      const mockCanvas = {
        toBlob: vi.fn((cb) => cb(mockBlob)),
      };
      mockToCanvas.mockResolvedValue(mockCanvas);

      await captureToBlob(mockElement, { scale: 2.5 });

      expect(mockToCanvas).toHaveBeenCalledWith(mockElement, { scale: 2.5 });
    });
  });

  describe("captureToDataUrl", () => {
    it("calls snapdom.toCanvas with scale 1 and returns data URL", async () => {
      const mockDataUrl = "data:image/png;base64,abc123";
      const mockCanvas = {
        toDataURL: vi.fn(() => mockDataUrl),
      };
      mockToCanvas.mockResolvedValue(mockCanvas);

      const result = await captureToDataUrl(mockElement);

      expect(mockToCanvas).toHaveBeenCalledWith(mockElement, { scale: 1 });
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/png");
      expect(result).toBe(mockDataUrl);
    });
  });
});
