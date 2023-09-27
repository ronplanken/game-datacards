import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import stringWidth from "string-width";

export const MarkdownSpanDisplay = ({ content, components }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[[remarkGfm, { stringLength: stringWidth }]]}
      rehypePlugins={[[rehypeSanitize]]}
      components={{ p: "div" }}>
      {content}
    </ReactMarkdown>
  );
};
