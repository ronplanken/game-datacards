import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveTheme } from "../../Helpers/theme.helpers";

const THEME_CSS = readFileSync(resolve(process.cwd(), "src/styles/theme.css"), "utf8");
const ANTD_DARK_CSS = readFileSync(resolve(process.cwd(), "src/styles/antd-dark.css"), "utf8");
const INDEX_HTML = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

const blockFor = (css, selector) => {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return "";
  return css.slice(start, css.indexOf("}", start));
};

const tokensIn = (block) => new Set([...block.matchAll(/(--gdc-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));

const parseColor = (value) => {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  return null;
};

const luminance = ({ r, g, b }) => {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const tokenValue = (block, token) => {
  const match = block.match(new RegExp(`${token}\\s*:\\s*([^;]+);`));
  return match ? match[1].trim() : undefined;
};

describe("theme tokens", () => {
  const lightBlock = blockFor(THEME_CSS, ":root");
  const darkBlock = blockFor(THEME_CSS, 'html[data-theme="dark"]');

  it("defines every light token for dark mode too", () => {
    const light = tokensIn(lightBlock);
    const dark = tokensIn(darkBlock);
    expect(light.size).toBeGreaterThan(20);
    expect([...light].filter((token) => !dark.has(token))).toEqual([]);
    expect([...dark].filter((token) => !light.has(token))).toEqual([]);
  });

  it("keeps dark text readable on dark surfaces", () => {
    const surfaces = ["--gdc-bg-app", "--gdc-bg-surface", "--gdc-bg-surface-alt", "--gdc-bg-elevated"];
    const texts = { "--gdc-text": 4.5, "--gdc-text-secondary": 4.5, "--gdc-text-tertiary": 4.5, "--gdc-link": 4.5 };
    surfaces.forEach((surface) => {
      const bg = parseColor(tokenValue(darkBlock, surface));
      Object.entries(texts).forEach(([token, minimum]) => {
        const fg = parseColor(tokenValue(darkBlock, token));
        expect(contrast(fg, bg), `${token} on ${surface}`).toBeGreaterThanOrEqual(minimum);
      });
    });
  });

  it("keeps white text readable on the dark primary button", () => {
    const bg = parseColor(tokenValue(darkBlock, "--gdc-primary-active"));
    expect(contrast({ r: 255, g: 255, b: 255 }, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("scopes every antd override to dark mode", () => {
    const rules = ANTD_DARK_CSS.replace(/\/\*[\s\S]*?\*\//g, "")
      .split("}")
      .map((rule) => rule.split("{").slice(-2, -1)[0]?.trim())
      .filter(Boolean);
    const unscoped = rules
      .flatMap((selectors) => selectors.split(",").map((selector) => selector.trim()))
      .filter((selector) => !selector.includes('html[data-theme="dark"]'));
    expect(unscoped).toEqual([]);
  });
});

describe("index.html theme script", () => {
  const script = INDEX_HTML.match(
    /<script type="text\/javascript">\s*(\(function \(\) \{[\s\S]*?data-theme[\s\S]*?\}\)\(\);)/,
  )[1];

  const runScript = (stored, prefersDark) => {
    localStorage.clear();
    if (stored !== undefined) localStorage.setItem("settings", JSON.stringify({ theme: stored }));
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = () => ({ matches: prefersDark });
    try {
      new Function(script)();
      return document.documentElement.getAttribute("data-theme");
    } finally {
      window.matchMedia = originalMatchMedia;
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.style.colorScheme = "";
      localStorage.clear();
    }
  };

  it("matches resolveTheme for every stored preference", () => {
    [undefined, "light", "dark", "system", "bogus"].forEach((stored) => {
      [true, false].forEach((prefersDark) => {
        expect(runScript(stored, prefersDark), `${stored} / ${prefersDark}`).toBe(resolveTheme(stored, prefersDark));
      });
    });
  });

  it("falls back to light when settings cannot be parsed", () => {
    localStorage.setItem("settings", "{not json");
    new Function(script)();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
  });
});
