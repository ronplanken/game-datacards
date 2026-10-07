import { localize } from "./localization.helpers";

const MAX_STACK_LINES = 15;

let errorContextCard = null;

export const setErrorContextCard = (card) => {
  errorContextCard = card || null;
};

export const getErrorContextCard = () => errorContextCard;

const readSettings = (storage) => {
  try {
    const raw = storage?.getItem("settings");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const trimStack = (stack) => {
  if (typeof stack !== "string" || stack.trim() === "") return null;
  return stack
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "")
    .slice(0, MAX_STACK_LINES)
    .join("\n");
};

const describeCard = (card) => {
  if (!card || typeof card !== "object") return null;
  const name = localize(card.name) || "unnamed";
  const parts = [name];
  if (card.cardType) parts.push(`type ${card.cardType}`);
  if (card.source) parts.push(`source ${card.source}`);
  if (card.variant) parts.push(`variant ${card.variant}`);
  if (card.faction_id) parts.push(`faction ${card.faction_id}`);
  if (card.id) parts.push(`id ${card.id}`);
  if (card.templateId) parts.push(`template ${card.templateId}`);
  return parts.join(", ");
};

const describeError = (error) => {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const buildEnv = () => ({
  VITE_VERSION: import.meta.env.VITE_VERSION,
  VITE_COMMIT: import.meta.env.VITE_COMMIT,
  VITE_PREMIUM_COMMIT: import.meta.env.VITE_PREMIUM_COMMIT,
  VITE_BUILD_ID: import.meta.env.VITE_BUILD_ID,
  VITE_EDITION: import.meta.env.VITE_EDITION,
});

export const buildErrorReport = ({
  error,
  env = buildEnv(),
  location = typeof window !== "undefined" ? window.location : null,
  storage = typeof window !== "undefined" ? window.localStorage : null,
  userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null,
  now = new Date(),
  activeCard = getErrorContextCard(),
  componentStack = null,
} = {}) => {
  const settings = readSettings(storage);
  const edition = env?.VITE_EDITION || "community";

  const fields = [
    ["Version", env?.VITE_VERSION || "unknown"],
    ["Commit", env?.VITE_COMMIT || "unknown"],
    ["Premium commit", edition === "premium" ? env?.VITE_PREMIUM_COMMIT || "unknown" : null],
    ["Build", env?.VITE_BUILD_ID || null],
    ["Edition", edition],
    ["Route", location ? `${location.pathname || ""}${location.search || ""}` || "/" : null],
    ["Datasource", settings?.selectedDataSource || "none"],
    ["Card language", settings?.language || null],
    ["11e data version", settings?.dataVersion11e?.version ?? null],
    ["Active card", describeCard(activeCard)],
    ["Time", now.toISOString()],
    ["Browser", userAgent],
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  return {
    fields,
    message: describeError(error),
    stack: trimStack(error?.stack),
    componentStack: trimStack(componentStack),
  };
};

export const formatErrorReport = (report) => {
  const lines = [`Error: ${report.message}`, "", ...report.fields.map(([label, value]) => `${label}: ${value}`)];
  if (report.stack) lines.push("", "Stack:", report.stack);
  if (report.componentStack) lines.push("", "Component stack:", report.componentStack);
  return lines.join("\n");
};
