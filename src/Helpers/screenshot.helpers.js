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
        for (const el of [...svg.querySelectorAll("metadata")]) {
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

function spanUnwrapPlugin() {
  return {
    name: "span-unwrap",
    afterClone(context) {
      // Weapon name spans in 40k-10e grid rows
      const lines = context.clone.querySelectorAll(".ranged .line, .melee .line");
      for (const line of lines) {
        const firstValue = line.querySelector(".value");
        if (!firstValue) continue;
        unwrapLeadingSpan(firstValue);
      }

      // AoS phase indicator badges
      const phaseTags = context.clone.querySelectorAll(".ability-phase-tag");
      for (const tag of phaseTags) {
        unwrapLeadingSpan(tag);
      }
    },
  };
}

function unwrapLeadingSpan(parent) {
  const span = parent.children[0];
  if (!span || span.tagName !== "SPAN" || span.children.length > 0) return;
  parent.replaceChild(parent.ownerDocument.createTextNode(span.textContent), span);
}

async function blobToDataUrl(blobUrl) {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function blobUrlPlugin() {
  return {
    name: "blob-url-fix",
    async afterClone(context) {
      const originals = context.element.querySelectorAll("[imageurl]");
      const clones = context.clone.querySelectorAll("[imageurl]");

      for (let i = 0; i < clones.length; i++) {
        const blobUrl = originals[i]?.getAttribute("imageurl");
        if (!blobUrl?.startsWith("blob:")) continue;
        try {
          const dataUrl = await blobToDataUrl(blobUrl);
          clones[i].setAttribute("imageurl", dataUrl);
        } catch {
          // Image couldn't be converted — leave as-is (will be missing)
        }
      }
    },
  };
}

function captureSvgPlugin(ref) {
  return {
    name: "capture-svg",
    afterRender(context) {
      ref.svgString = context.svgString;
    },
  };
}

async function rasterizeSvgToCanvas(svgString) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function buildOptions(scale, extraPlugins = []) {
  return {
    scale,
    embedFonts: true,
    plugins: [svgCleanupPlugin(), spanUnwrapPlugin(), blobUrlPlugin(), ...extraPlugins],
  };
}

export const captureToBlob = async (element, { scale = 1.5 } = {}) => {
  const ref = {};
  const options = buildOptions(scale, [captureSvgPlugin(ref)]);

  try {
    return await snapdom.toBlob(element, { ...options, type: "png" });
  } catch (err) {
    if (!ref.svgString) throw err;
    const canvas = await rasterizeSvgToCanvas(ref.svgString);
    return new Promise((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned null"))), "image/png"),
    );
  }
};

export const captureToDataUrl = async (element, { scale = 1 } = {}) => {
  const ref = {};
  const options = buildOptions(scale, [captureSvgPlugin(ref)]);

  try {
    const img = await snapdom.toPng(element, options);
    return img.src;
  } catch (err) {
    if (!ref.svgString) throw err;
    const canvas = await rasterizeSvgToCanvas(ref.svgString);
    return canvas.toDataURL("image/png");
  }
};
