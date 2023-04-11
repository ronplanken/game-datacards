import ReactMarkdown from "react-markdown";
import rehypeRemark from "rehype-remark";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import stringWidth from "string-width";

export const MarkdownDisplay = ({ content }) => {
  return (
    <ReactMarkdown remarkPlugins={[[remarkGfm, { stringLength: stringWidth }]]} rehypePlugins={[[rehypeSanitize]]}>
      {content}
    </ReactMarkdown>
  );
};
