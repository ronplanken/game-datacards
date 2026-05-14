import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * A collapsible row inside a `props-field-list`.
 *
 * Collapsing keeps long lists (ability categories, sections, weapon columns,
 * glossary keywords) scannable — the header shows the entry's title so the
 * full list reads as an overview. Reorder/delete `actions` stay outside the
 * collapsible body so they remain reachable while collapsed.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.title - Header label (usually the entry name/key)
 * @param {React.ReactNode} [props.actions] - Buttons rendered in the always-visible action column
 * @param {boolean} [props.defaultOpen=false] - Whether the body starts expanded
 * @param {React.ReactNode} props.children - The entry's input fields
 */
export const CollapsibleFieldItem = ({ title, actions, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="props-field-item props-collapsible-item">
      <div className="props-collapsible-item-row">
        <button
          type="button"
          className="props-collapsible-item-header"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="props-collapsible-item-title">{title}</span>
        </button>
        {actions && <div className="props-field-item-actions props-collapsible-item-actions">{actions}</div>}
      </div>
      {open && <div className="props-collapsible-item-body">{children}</div>}
    </div>
  );
};
