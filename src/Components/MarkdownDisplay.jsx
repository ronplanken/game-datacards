import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import stringWidth from "string-width";

import rehype40k from "./rehype-40k";

export const MarkdownDisplay = ({ content, components }) => {
  return (
    <ReactMarkdown remarkPlugins={[[remarkGfm, { stringLength: stringWidth }]]} rehypePlugins={[[rehype40k]]}>
      {content}
    </ReactMarkdown>
  );
};
