import fs from "fs";
import path from "path";
import * as stub from "../index";

const communitySrcRoot = path.resolve(process.cwd(), "src");
const premiumIndexPath = path.resolve(process.cwd(), "../gdc-premium/src/index.js");
const premiumRepoAvailable = fs.existsSync(premiumIndexPath);

const PREMIUM_ALIAS_SOURCE = /^(\.\.?\/)+Premium$/;

const walkFiles = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "__tests__" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (/\.(jsx?|mdx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
};

const collectPremiumImportNames = () => {
  const names = new Set();
  const importPattern = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']([^"']+)["']/g;

  for (const file of walkFiles(communitySrcRoot)) {
    const text = fs.readFileSync(file, "utf8");
    let match;
    importPattern.lastIndex = 0;
    while ((match = importPattern.exec(text))) {
      const [, specifiers, source] = match;
      if (!PREMIUM_ALIAS_SOURCE.test(source)) continue;
      for (const raw of specifiers.split(",")) {
        const spec = raw.trim();
        if (!spec) continue;
        const asMatch = spec.match(/^(\w+)\s+as\s+\w+$/);
        names.add(asMatch ? asMatch[1] : spec);
      }
    }
  }
  return names;
};

const extractNamedExports = (source) => {
  const names = new Set();
  for (const m of source.matchAll(/export\s+const\s+(\w+)/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s+function\s+(\w+)/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const raw of m[1].split(",")) {
      const spec = raw.trim();
      if (!spec) continue;
      const asMatch = spec.match(/^(\w+)\s+as\s+(\w+)$/);
      names.add(asMatch ? asMatch[2] : spec);
    }
  }
  return names;
};

describe("Premium stub / premium package export parity", () => {
  it("every stub export the app actually imports from Premium has a matching name in the stub itself", () => {
    const stubNames = new Set(Object.keys(stub));
    const importedNames = collectPremiumImportNames();

    const missing = [...importedNames].filter((name) => !stubNames.has(name));
    expect(missing).toEqual([]);
  });

  it.skipIf(!premiumRepoAvailable)(
    "every stub export the app imports from Premium also exists in the gdc-premium package index",
    () => {
      const premiumSource = fs.readFileSync(premiumIndexPath, "utf8");
      const premiumNames = extractNamedExports(premiumSource);
      const importedNames = collectPremiumImportNames();

      const missing = [...importedNames].filter((name) => !premiumNames.has(name));
      expect(missing).toEqual([]);
    },
  );

  it.skipIf(!premiumRepoAvailable)(
    "every named export of the community stub also exists in the gdc-premium package index",
    () => {
      const premiumSource = fs.readFileSync(premiumIndexPath, "utf8");
      const premiumNames = extractNamedExports(premiumSource);
      const stubNames = new Set(Object.keys(stub));

      const missing = [...stubNames].filter((name) => !premiumNames.has(name));
      expect(missing).toEqual([]);
    },
  );
});
