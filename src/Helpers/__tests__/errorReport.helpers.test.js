import { describe, it, expect, beforeEach } from "vitest";
import {
  buildErrorReport,
  formatErrorReport,
  resetErrorContext,
  setErrorContextCard,
  setErrorContextComponentStack,
  getErrorContext,
} from "../errorReport.helpers";

const storageWith = (settings) => ({
  getItem: (key) => (key === "settings" && settings ? JSON.stringify(settings) : null),
});

const env = {
  VITE_VERSION: "3.13.2",
  VITE_COMMIT: "5f10062",
  VITE_PREMIUM_COMMIT: "290ab9c",
  VITE_BUILD_ID: "abc123",
  VITE_EDITION: "premium",
};

const location = { pathname: "/designer", search: "?tab=data", hash: "#listforge=secret" };
const now = new Date("2026-10-06T10:00:00.000Z");

const fieldMap = (report) => Object.fromEntries(report.fields);

describe("buildErrorReport", () => {
  beforeEach(() => resetErrorContext());

  it("collects version, commits, route, datasource and active card", () => {
    const report = buildErrorReport({
      error: new Error("Minified React error #31"),
      env,
      location,
      storage: storageWith({
        selectedDataSource: "40k-11e",
        language: "de",
        dataVersion11e: { version: "972", url: "https://example.test" },
      }),
      userAgent: "TestBrowser/1.0",
      now,
      context: {
        activeCard: {
          name: { en: "Castellan", de: "Kastellan" },
          cardType: "DataCard",
          source: "40k-11e",
          variant: "double",
          faction_id: "bt",
          id: "c754",
          templateId: "tpl-1",
        },
        componentStack: "\n    at Tooltip\n    at CoreAbilitySpans",
      },
    });

    expect(report.message).toBe("Minified React error #31");
    expect(fieldMap(report)).toEqual({
      Version: "3.13.2",
      Commit: "5f10062",
      "Premium commit": "290ab9c",
      Build: "abc123",
      Edition: "premium",
      Route: "/designer?tab=data",
      Datasource: "40k-11e",
      "Card language": "de",
      "11e data version": "972",
      "Active card": "Castellan, type DataCard, source 40k-11e, variant double, faction bt, id c754, template tpl-1",
      Time: "2026-10-06T10:00:00.000Z",
      Browser: "TestBrowser/1.0",
    });
    expect(report.componentStack).toBe("    at Tooltip\n    at CoreAbilitySpans");
  });

  it("leaves out the URL hash and premium commit on the community edition", () => {
    const report = buildErrorReport({
      error: new Error("boom"),
      env: { VITE_VERSION: "3.13.2", VITE_COMMIT: "5f10062", VITE_EDITION: "community" },
      location,
      storage: storageWith(null),
      userAgent: null,
      now,
      context: { activeCard: null, componentStack: null },
    });
    const fields = fieldMap(report);

    expect(fields.Route).toBe("/designer?tab=data");
    expect(fields["Premium commit"]).toBeUndefined();
    expect(fields.Datasource).toBe("none");
    expect(fields["Active card"]).toBeUndefined();
    expect(formatErrorReport(report)).not.toContain("secret");
  });

  it("survives unreadable settings and non-Error values", () => {
    const report = buildErrorReport({
      error: { status: 500 },
      env: {},
      location: null,
      storage: { getItem: () => "{not json" },
      now,
      context: {},
    });
    const fields = fieldMap(report);

    expect(report.message).toBe('{"status":500}');
    expect(fields.Version).toBe("unknown");
    expect(fields.Commit).toBe("unknown");
    expect(fields.Datasource).toBe("none");
    expect(report.stack).toBeNull();
  });

  it("limits long stacks to the first 15 lines", () => {
    const error = new Error("deep");
    error.stack = Array.from({ length: 40 }, (_, i) => `at frame${i}`).join("\n");
    const report = buildErrorReport({ error, env, location, storage: storageWith(null), now, context: {} });
    expect(report.stack.split("\n")).toHaveLength(15);
  });
});

describe("error context", () => {
  beforeEach(() => resetErrorContext());

  it("stores the active card and component stack", () => {
    setErrorContextCard({ name: "Marshal" });
    setErrorContextComponentStack("at UnitCard");
    expect(getErrorContext()).toEqual({ activeCard: { name: "Marshal" }, componentStack: "at UnitCard" });
  });
});

describe("formatErrorReport", () => {
  it("renders a plain text block for Discord", () => {
    const text = formatErrorReport({
      message: "boom",
      fields: [
        ["Version", "3.13.2"],
        ["Route", "/"],
      ],
      stack: "Error: boom\n    at x",
      componentStack: "    at App",
    });
    expect(text).toBe(
      "Error: boom\n\nVersion: 3.13.2\nRoute: /\n\nStack:\nError: boom\n    at x\n\nComponent stack:\n    at App",
    );
  });
});
