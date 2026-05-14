import React, { Fragment } from "react";
import { Tooltip } from "../../../Tooltip/Tooltip";
import {
  collectKeywordExplanations,
  findGlossaryMatchesInText,
  resolveKeywordEntry,
  resolveKeywordStyle,
} from "../../../../Helpers/customSchema.helpers";

const tooltipProps = { placement: "bottom-start" };

/**
 * Splits a free-text keyword cell ("Target (Ground), Long Range (18\")") into
 * individual keyword tags. Used by base systems (e.g. Starcraft TMG) that
 * store weapon keywords as a comma-separated string column rather than an
 * array. Commas inside parentheses are not split points.
 *
 * @param {string} value
 * @returns {string[]}
 */
export const splitKeywordString = (value) => {
  if (typeof value !== "string" || !value.trim()) return [];
  const tags = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === "," && depth === 0) {
      if (current.trim()) tags.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) tags.push(current.trim());
  return tags;
};

/**
 * Deduplicated glossary explanation entries for a flat list of keyword tags.
 * Mirrors the 40K weapon renderer: entries whose `displayMode` is `"tooltip"`
 * are excluded because their description shows on hover over the inline tag,
 * not in an explanation row.
 *
 * @param {string[]} keywords - Keyword tags collected from weapon profiles
 * @param {Array} glossary - The schema's keywordGlossary array
 * @param {string} [scope="weapons"] - One of VALID_GLOSSARY_SCOPES
 * @returns {object[]}
 */
export const getKeywordExplanations = (keywords, glossary, scope = "weapons") =>
  collectKeywordExplanations(keywords, glossary, scope).filter((entry) => entry.displayMode !== "tooltip");

/**
 * Inline keyword tags resolved against the datasource glossary. Each keyword
 * gets its own caps/brackets/weight from its glossary entry's `style` (see
 * `resolveKeywordStyle`); entries with `displayMode: "tooltip"` show their
 * description on hover and carry the `ds-kw-tag--has-info` underline. Keywords
 * with no glossary match render as plain tags.
 *
 * Renders system-neutral classes (`ds-kw-*`) so each base system's stylesheet
 * can theme the tags to match its card design.
 *
 * @param {Object} props
 * @param {string[]} props.keywords - Keyword tags to render
 * @param {Array} [props.glossary] - The schema's keywordGlossary array
 * @param {string} [props.scope="weapons"] - Glossary scope to resolve against
 * @param {string} [props.separator=", "] - Text rendered between tags
 */
export const GlossaryKeywordTags = ({ keywords, glossary, scope = "weapons", separator = ", " }) => {
  if (!Array.isArray(keywords) || keywords.length === 0) return null;
  const hasGlossary = Array.isArray(glossary) && glossary.length > 0;

  return (
    <span className="ds-kw-tags">
      {keywords.map((keyword, index) => {
        const entry = hasGlossary ? resolveKeywordEntry(keyword, glossary, scope) : null;
        const style = resolveKeywordStyle(entry);
        const isTooltip = entry?.displayMode === "tooltip" && !!entry.description;

        const classes = ["ds-kw-tag"];
        if (isTooltip) classes.push("ds-kw-tag--has-info");
        if (style.casing !== "uppercase") classes.push("ds-kw-tag--no-caps");
        if (style.weight !== "bold") classes.push("ds-kw-tag--no-bold");

        const label = style.brackets === "square" ? `[${keyword}]` : keyword;
        const tag = <span className={classes.join(" ")}>{label}</span>;

        return (
          <Fragment key={`${keyword}-${index}`}>
            {index > 0 && separator}
            {isTooltip ? (
              <Tooltip {...tooltipProps} content={entry.description}>
                {tag}
              </Tooltip>
            ) : (
              tag
            )}
          </Fragment>
        );
      })}
    </span>
  );
};

/**
 * Explanation rows for a set of resolved glossary entries — the "explanation
 * line" treatment that mirrors the built-in 40K weapon ability rows. Render
 * the entries from `getKeywordExplanations`. System-neutral markup themed by
 * each base system's stylesheet.
 *
 * @param {Object} props
 * @param {object[]} props.entries - Glossary entries (from getKeywordExplanations)
 */
export const GlossaryExplanationRows = ({ entries }) => {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  return (
    <div className="ds-kw-explanations" data-testid="ds-kw-explanations">
      {entries.map((entry) => (
        <div className="ds-kw-explanation" key={`ds-kw-exp-${entry.key}`}>
          <span className="ds-kw-explanation-name">{entry.name}</span>
          <span className="ds-kw-explanation-desc">{entry.description}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Free text with inline glossary keyword tooltips. Glossary entries scoped to
 * `scope` with `displayMode: "tooltip"` get a dotted underline + hover tooltip
 * wherever their name appears in the text (whole-word, case-insensitive).
 * Non-matching text renders verbatim. When nothing matches, the original
 * string is returned unchanged so callers can drop this in transparently.
 *
 * @param {Object} props
 * @param {string} props.text - The free-text description to scan
 * @param {Array} [props.glossary] - The schema's keywordGlossary array
 * @param {string} [props.scope="abilities"] - Glossary scope to resolve against
 * @param {Array} [props.matches] - Pre-computed `findGlossaryMatchesInText` result;
 *   pass it when the caller already scanned the text to avoid a second scan.
 */
export const GlossaryText = ({ text, glossary, scope = "abilities", matches }) => {
  if (typeof text !== "string" || text === "") return text || null;
  const resolved = matches ?? findGlossaryMatchesInText(text, glossary, scope);
  if (resolved.length === 0) return text;

  const nodes = [];
  let pos = 0;
  resolved.forEach((match, index) => {
    if (match.start > pos) nodes.push(text.slice(pos, match.start));
    nodes.push(
      <Tooltip {...tooltipProps} content={match.entry.description} key={`ds-kw-text-${index}`}>
        <span className="ds-kw-inline ds-kw-tag--has-info">{match.text}</span>
      </Tooltip>,
    );
    pos = match.end;
  });
  if (pos < text.length) nodes.push(text.slice(pos));

  return <>{nodes}</>;
};
