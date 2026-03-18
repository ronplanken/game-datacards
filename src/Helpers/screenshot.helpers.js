import { snapdom } from "@zumer/snapdom";

const STRIP_NS_PREFIXES = ["xmlns:dc", "xmlns:cc", "xmlns:rdf", "xmlns:sodipodi", "xmlns:inkscape"];

function svgCleanupPlugin() {
  return {
    name: "svg-cleanup",
    afterClone(context) {
      const svgs = context.clone.querySelectorAll("svg");
      for (const svg of svgs) {
        for (const ns of STRIP_NS_PREFIXES) {
          svg.removeAttribute(ns);
        }
        const attrs = [...svg.attributes];
        for (const attr of attrs) {
          if (attr.name.startsWith("inkscape:") || attr.name.startsWith("sodipodi:")) {
            svg.removeAttribute(attr.name);
          }
        }
        for (const el of [...svg.querySelectorAll("metadata, defs")]) {
          el.remove();
        }
        for (const el of [...svg.children]) {
          if (el.tagName.toLowerCase().includes("namedview")) {
            el.remove();
          }
        }
      }
    },
  };
}

const defaultOptions = {
  embedFonts: true,
  plugins: [svgCleanupPlugin()],
};

export const captureToBlob = async (element, { scale = 1.5 } = {}) => {
  return snapdom.toBlob(element, { ...defaultOptions, type: "png", scale });
};

export const captureToDataUrl = async (element) => {
  const img = await snapdom.toPng(element, { ...defaultOptions, scale: 1 });
  return img.src;
};
