import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import stringWidth from "string-width";

// Custom sanitization schema that allows color styles on span elements and br tags
const customSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "span", "br"],
  attributes: {
    ...defaultSchema.attributes,
    span: ["style"],
  },
  protocols: {
    ...defaultSchema.protocols,
  },
};

export const MarkdownSpanWrapDisplay = ({ content, components }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[
        [remarkGfm, { stringLength: stringWidth }],
        remarkBreaks, // This helps with line break handling
      ]}
      rehypePlugins={[
        rehypeRaw, // Allows raw HTML (needed for span tags)
        [rehypeSanitize, customSchema], // Sanitize but allow our color styles
      ]}
      components={{
        p(props) {
          const { node, ...rest } = props;
          return <span style={{ whiteSpace: "pre-wrap" }} {...rest} />;
        },
        span(props) {
          const { node, style, ...rest } = props;
          // Only allow color styles for security
          const safeStyle = {};
          if (style?.color) {
            safeStyle.color = style.color;
          }
          return <span style={safeStyle} {...rest} />;
        },
        br() {
          return <br />;
        },
      }}>
      {content}
    </ReactMarkdown>
  );
};
