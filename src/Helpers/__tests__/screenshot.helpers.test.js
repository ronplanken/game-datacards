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

    it("passes all export plugins", async () => {
      mockToBlob.mockResolvedValue(mockBlob);

      await captureToBlob(mockElement);

      const opts = mockToBlob.mock.calls[0][1];
      expect(opts.plugins).toHaveLength(3);
      expect(opts.plugins[0].name).toBe("svg-cleanup");
      expect(opts.plugins[1].name).toBe("span-unwrap");
      expect(opts.plugins[2].name).toBe("capture-svg");
    });

    it("re-throws original error when no svgString was captured", async () => {
      const originalError = new DOMException("Invalid encoded image data");
      mockToBlob.mockRejectedValue(originalError);

      await expect(captureToBlob(mockElement)).rejects.toBe(originalError);
    });
  });

  describe("captureToDataUrl", () => {
    it("calls snapdom.toPng with default scale 1", async () => {
      const mockDataUrl = "data:image/png;base64,abc123";
      mockToPng.mockResolvedValue({ src: mockDataUrl });

      const result = await captureToDataUrl(mockElement);

      expect(mockToPng).toHaveBeenCalledWith(mockElement, expect.objectContaining({ scale: 1, embedFonts: true }));
      expect(result).toBe(mockDataUrl);
    });

    it("calls snapdom.toPng with custom scale", async () => {
      mockToPng.mockResolvedValue({ src: "data:image/png;base64,abc" });

      await captureToDataUrl(mockElement, { scale: 2 });

      expect(mockToPng).toHaveBeenCalledWith(mockElement, expect.objectContaining({ scale: 2 }));
    });

    it("re-throws original error when no svgString was captured", async () => {
      const originalError = new DOMException("Invalid encoded image data");
      mockToPng.mockRejectedValue(originalError);

      await expect(captureToDataUrl(mockElement)).rejects.toBe(originalError);
    });
  });

  describe("svgCleanupPlugin", () => {
    it("strips Inkscape namespaces and metadata but preserves defs", async () => {
      mockToBlob.mockImplementation(async (_el, opts) => {
        const doc = document.implementation.createHTMLDocument();
        const clone = doc.createElement("div");
        clone.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:version="0.92">
          <metadata><rdf:RDF></rdf:RDF></metadata>
          <defs><linearGradient id="g1"/></defs>
          <rect width="10" height="10"/>
        </svg>`;
        const context = { element: _el, clone };
        for (const plugin of opts.plugins) {
          if (plugin.afterClone) plugin.afterClone(context);
        }
        const svg = clone.querySelector("svg");
        expect(svg.getAttribute("xmlns:inkscape")).toBeNull();
        expect(svg.getAttribute("inkscape:version")).toBeNull();
        expect(clone.querySelector("metadata")).toBeNull();
        expect(clone.querySelector("defs")).not.toBeNull();
        expect(clone.querySelector("linearGradient")).not.toBeNull();
        return mockBlob;
      });

      await captureToBlob(mockElement);
    });
  });

  describe("spanUnwrapPlugin", () => {
    it("unwraps weapon name spans in grid rows", async () => {
      mockToBlob.mockImplementation(async (_el, opts) => {
        const doc = document.implementation.createHTMLDocument();
        const clone = doc.createElement("div");
        clone.innerHTML = `<div class="ranged"><div class="line"><div class="value"><span>Bolt Rifle</span></div></div></div>`;
        const context = { element: _el, clone };
        for (const plugin of opts.plugins) {
          if (plugin.afterClone) plugin.afterClone(context);
        }
        const value = clone.querySelector(".value");
        expect(value.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(value.childNodes[0].textContent).toBe("Bolt Rifle");
        return mockBlob;
      });

      await captureToBlob(mockElement);
    });

    it("unwraps AoS phase tag spans", async () => {
      mockToBlob.mockImplementation(async (_el, opts) => {
        const doc = document.implementation.createHTMLDocument();
        const clone = doc.createElement("div");
        clone.innerHTML = `<div class="ability-phase-tag"><span>Hero Phase</span></div>`;
        const context = { element: _el, clone };
        for (const plugin of opts.plugins) {
          if (plugin.afterClone) plugin.afterClone(context);
        }
        const tag = clone.querySelector(".ability-phase-tag");
        expect(tag.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(tag.childNodes[0].textContent).toBe("Hero Phase");
        return mockBlob;
      });

      await captureToBlob(mockElement);
    });

    it("skips spans with child elements", async () => {
      mockToBlob.mockImplementation(async (_el, opts) => {
        const doc = document.implementation.createHTMLDocument();
        const clone = doc.createElement("div");
        clone.innerHTML = `<div class="ranged"><div class="line"><div class="value"><span><em>nested</em></span></div></div></div>`;
        const context = { element: _el, clone };
        for (const plugin of opts.plugins) {
          if (plugin.afterClone) plugin.afterClone(context);
        }
        const value = clone.querySelector(".value");
        expect(value.children[0].tagName).toBe("SPAN");
        return mockBlob;
      });

      await captureToBlob(mockElement);
    });
  });
});
