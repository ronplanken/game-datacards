import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "./Tooltip.css";

export const Tooltip = ({ children, content, placement = "top", ...props }) => {
  if (!content) return children;

  return (
    <Tippy content={content} placement={placement} theme="dark" {...props}>
      {children}
    </Tippy>
  );
};
