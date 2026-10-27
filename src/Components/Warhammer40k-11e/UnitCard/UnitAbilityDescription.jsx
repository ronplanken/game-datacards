import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import stringWidth from "string-width";
import { Tooltip } from "../../Tooltip/Tooltip";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { use11eKeywordGlossary } from "../../../Hooks/use11eKeywordGlossary";
import { localize } from "../../../Helpers/localization.helpers";
import { resolveKeywordEntry } from "../../../Helpers/customSchema.helpers";

// 11th edition descriptions use their own rich-text markup (instead of the 10e
// bracket/regex keyword dictionary):
//   <k>keyword</k>  -> highlighted keyword (already final, no dictionary needed)
//   <b>bold</b>     -> bold (standard markdown/HTML)
//   <bi>text</bi>   -> bold italic (used by translated codex descriptions)
//   <ul><li>..</li> -> bullet list
//   \r / \n         -> line break
//   ■               -> box bullet (rendered on its own line, matching 10e)
// Because keywords are already explicitly marked up in the data, this also
// sidesteps the English-only regex dictionary used by the 10e renderer.

// Sanitisation schema: the GitHub default already allows strong/b/ul/li/em; we
// additionally allow <span class="keyword"> so converted <k> tags can be styled,
// and <span style="..."> so the editor's colour picker survives sanitisation
// (only the colour is kept — see the `span` renderer below).
const schema11e = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "span", "br"],
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span || []), "className", "style"],
  },
};

/**
 * Convert 11th edition markup into markdown/HTML the renderer understands.
 * @param {string} text - Already-localised text.
 * @returns {string}
 */
export const normalize11eMarkup = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\r\n?/g, "\n") // CRLF / CR -> LF
    .replace(/<bi>([\s\S]*?)<\/bi>/gi, "<b><i>$1</i></b>")
    .replace(/<k>([\s\S]*?)<\/k>/gi, '<span class="gdc-keyword">$1</span>') // keyword highlight
    .replace(/\s*■\s*/g, "\n■ "); // box bullets onto their own line
};

// Plain text of a hast element, or null when it holds anything but text (e.g.
// <b><i>..</i></b>), so only simple keyword markup is looked up.
const getPlainText = (node) => {
  const children = node?.children || [];
  if (children.length === 0 || children.some((child) => child.type !== "text")) return null;
  return children.map((child) => child.value).join("");
};

// Square brackets (ASCII and full-width) that 11e text puts around weapon keywords.
const BRACKETED_KEYWORD = /^\s*[[\uFF3B]\s*([\s\S]*?)\s*[\]\uFF3D]\s*$/;

/**
 * Add a copy of each entry under every localised name (`nameLoc`), so a keyword
 * written in the card's display language resolves like its English name.
 * @param {Array} glossary - The 11e keyword glossary.
 * @returns {Array}
 */
export const expandLocalizedGlossary = (glossary) => {
  if (!Array.isArray(glossary)) return [];
  return glossary.flatMap((entry) => {
    const names = Object.values(entry?.nameLoc || {}).filter((name) => typeof name === "string" && name !== entry.name);
    return [entry, ...[...new Set(names)].map((name) => ({ ...entry, name }))];
  });
};

/**
 * Resolve a keyword written inside ability text to its glossary entry. Ability
 * keywords (e.g. <b>Lone Operative</b>) resolve against the "abilities" scope;
 * bracketed weapon keywords (e.g. <k>[Lethal Hits]</k>) also fall back to the
 * "weapons" scope.
 * @param {string|null} text - The element's plain text.
 * @param {Array} glossary - The 11e keyword glossary (see expandLocalizedGlossary).
 * @returns {object|null}
 */
export const resolveInlineKeywordEntry = (text, glossary) => {
  if (!text || !Array.isArray(glossary) || glossary.length === 0) return null;
  // 11e text writes some hyphenated keywords (Anti-X) with a non-breaking hyphen.
  const normalized = text.replace(/\u2011/g, "-");
  const bracketed = normalized.match(BRACKETED_KEYWORD);
  const keyword = bracketed ? bracketed[1] : normalized;
  return (
    resolveKeywordEntry(keyword, glossary, "abilities") ||
    (bracketed ? resolveKeywordEntry(keyword, glossary, "weapons") : null)
  );
};

/**
 * Render a plain (already-localised) markup string. Pass `glossary` to give
 * keywords (<k> and bold text) that match a glossary entry a hover tooltip.
 */
export const MarkupText = ({ content, glossary }) => {
  const lookupGlossary = useMemo(() => (glossary ? expandLocalizedGlossary(glossary) : null), [glossary]);
  let paragraphCount = 0;
  // Wraps a keyword element in a tooltip when its text resolves to a glossary entry.
  const withGlossaryTooltip = (node, element) => {
    const entry = lookupGlossary ? resolveInlineKeywordEntry(getPlainText(node), lookupGlossary) : null;
    if (!entry) return element;
    return (
      <Tooltip placement="bottom" content={<LocalizedMarkup value={entry.descriptionLoc ?? entry.description} />}>
        {React.cloneElement(element, {
          className: [element.props.className, "keyword-info"].filter(Boolean).join(" "),
        })}
      </Tooltip>
    );
  };
  return (
    <ReactMarkdown
      remarkPlugins={[[remarkGfm, { stringLength: stringWidth }], remarkBreaks]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, schema11e]]}
      components={{
        // `remarkBreaks` already turns every newline into a <br>, so the text
        // must not also honour the literal newline it left behind: `pre-wrap`
        // (inherited from `.item`) would render both and put a blank line
        // between every bullet. Markdown strips leading indentation before we
        // get here, so there is no whitespace left for `pre-wrap` to preserve.
        p(props) {
          const { node, ...rest } = props;
          paragraphCount++;
          if (paragraphCount > 1) {
            return (
              <React.Fragment>
                <span style={{ display: "block", height: "8px" }} aria-hidden="true" />
                <span style={{ whiteSpace: "normal" }} {...rest} />
              </React.Fragment>
            );
          }
          return <span style={{ whiteSpace: "normal" }} {...rest} />;
        },
        // The editor's colour picker writes <span style="color: …">, and <k>
        // keywords arrive here as <span class="gdc-keyword">. Keep the class and
        // the colour, drop every other style (matching the 10e renderer).
        span(props) {
          const { node, style, ...rest } = props;
          const element = <span style={style?.color ? { color: style.color } : undefined} {...rest} />;
          return rest.className === "gdc-keyword" ? withGlossaryTooltip(node, element) : element;
        },
        // Ability keywords are usually bolded (e.g. <b>Lone Operative</b>).
        b(props) {
          const { node, ...rest } = props;
          return withGlossaryTooltip(node, <b {...rest} />);
        },
        strong(props) {
          const { node, ...rest } = props;
          return withGlossaryTooltip(node, <strong {...rest} />);
        },
        br() {
          return <br />;
        },
      }}>
      {normalize11eMarkup(content)}
    </ReactMarkdown>
  );
};

/**
 * Resolve a language-keyed value to the user's language, then render its markup.
 */
export const LocalizedMarkup = ({ value }) => {
  const { settings } = useSettingsStorage();
  return <MarkupText content={localize(value, settings.language)} />;
};

/**
 * Named ability block: localised name + localised markup description. Keywords
 * in the description get keyword-glossary tooltips.
 */
export const UnitAbilityDescription = ({ name, description }) => {
  const { settings } = useSettingsStorage();
  const glossary = use11eKeywordGlossary();
  return (
    <div className="ability">
      <span className="name">{localize(name, settings.language)}</span>
      <span className="description">
        <MarkupText content={localize(description, settings.language)} glossary={glossary} />
      </span>
    </div>
  );
};
