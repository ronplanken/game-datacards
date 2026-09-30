export const LATEST_DATA_VERSION = "latest";

export const get11eVersionsManifestUrl = (baseUrl) => {
  if (!baseUrl) return undefined;
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL("../versions.json", base).href;
};

export const parse11eVersionsManifest = (data) => {
  const entries = Array.isArray(data?.versions) ? data.versions : [];
  return entries
    .filter((entry) => Number.isInteger(entry?.version) && typeof entry?.url === "string" && entry.url)
    .map((entry) => ({ version: entry.version, url: entry.url.replace(/\/+$/, "") }))
    .sort((a, b) => b.version - a.version);
};

export const build11eDataVersionOptions = (versions = [], pinned = null) => {
  const list = [...versions];
  if (pinned && !list.some((entry) => entry.version === pinned.version)) {
    list.push(pinned);
    list.sort((a, b) => b.version - a.version);
  }
  return [
    { value: LATEST_DATA_VERSION, label: "Latest" },
    ...list.map((entry) => ({ value: String(entry.version), label: `Data version ${entry.version}` })),
  ];
};

export const resolve11eDataVersion = (value, versions = [], pinned = null) => {
  if (!value || value === LATEST_DATA_VERSION) return null;
  const version = Number(value);
  const match = versions.find((entry) => entry.version === version);
  if (match) return { version: match.version, url: match.url };
  if (pinned?.version === version) return pinned;
  return null;
};

export const get11eDataVersionValue = (pinned) => (pinned?.version ? String(pinned.version) : LATEST_DATA_VERSION);
