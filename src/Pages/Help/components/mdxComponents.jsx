import React from "react";
import { Callout } from "./Callout";
import { Kbd } from "./Kbd";
import { ShortcutsTable } from "./ShortcutsTable";
import { StepList, Step } from "./StepList";
import { Icon } from "./Icon";
import { IconLabel } from "./IconLabel";
import { Figure } from "./Figure";
import { WorkspaceMap } from "./WorkspaceMap";

function slugify(text) {
  const str = typeof text === "string" ? text : React.Children.toArray(text).join("");
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const mdxComponents = {
  h2: (props) => <h2 id={slugify(props.children)} className="help-heading" {...props} />,
  h3: (props) => <h3 id={slugify(props.children)} className="help-heading" {...props} />,
  code: (props) => <code className="help-code" {...props} />,
  table: (props) => (
    <div className="help-table-wrapper">
      <table {...props} />
    </div>
  ),
  ul: (props) => <ul className="help-list" {...props} />,
  ol: (props) => <ol className="help-list help-list-numbered" {...props} />,
  Callout,
  Kbd,
  ShortcutsTable,
  StepList,
  Step,
  Icon,
  IconLabel,
  Figure,
  WorkspaceMap,
};
