import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import stringWidth from "string-width";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";

// 11th edition descriptions use their own rich-text markup (instead of the 10e
// bracket/regex keyword dictionary):
//   <k>keyword</k>  -> highlighted keyword (already final, no dictionary needed)
//   <b>bold</b>     -> bold (standard markdown/HTML)
//   <ul><li>..</li> -> bullet list
//   \r / \n         -> line break
//   ■               -> box bullet (rendered on its own line, matching 10e)
// Because keywords are already explicitly marked up in the data, this also
// sidesteps the English-only regex dictionary used by the 10e renderer.

// Sanitisation schema: the GitHub default already allows strong/b/ul/li/em; we
// additionally allow <span class="keyword"> so converted <k> tags can be styled.
const schema11e = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "span", "br"],
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span || []), "className"],
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
    .replace(/<k>([\s\S]*?)<\/k>/gi, '<span class="gdc-keyword">$1</span>') // keyword highlight
    .replace(/\s*■\s*/g, "\n■ "); // box bullets onto their own line
};

/**
 * Render a plain (already-localised) markup string.
 */
export const MarkupText = ({ content }) => {
  let paragraphCount = 0;
  return (
    <ReactMarkdown
      remarkPlugins={[[remarkGfm, { stringLength: stringWidth }], remarkBreaks]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, schema11e]]}
      components={{
        p(props) {
          const { node, ...rest } = props;
          paragraphCount++;
          if (paragraphCount > 1) {
            return (
              <React.Fragment>
                <span style={{ display: "block", height: "8px" }} aria-hidden="true" />
                <span style={{ whiteSpace: "pre-wrap" }} {...rest} />
              </React.Fragment>
            );
          }
          return <span style={{ whiteSpace: "pre-wrap" }} {...rest} />;
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
 * Named ability block: localised name + localised markup description.
 */
export const UnitAbilityDescription = ({ name, description }) => {
  const { settings } = useSettingsStorage();
  return (
    <div className="ability">
      <span className="name">{localize(name, settings.language)}</span>
      <span className="description">
        <MarkupText content={localize(description, settings.language)} />
      </span>
    </div>
  );
};
