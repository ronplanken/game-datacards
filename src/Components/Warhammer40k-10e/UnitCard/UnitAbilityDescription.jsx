import React from "react";
import { KeywordTooltip } from "./KeywordTooltip";
import { RuleTooltip } from "./RuleTooltip";
import { MarkdownSpanWrapDisplay } from "../../MarkdownSpanWrapDisplay";
export function replaceKeywords(inputString) {
  if (!inputString) {
    return;
  }
  const keywordRegex = /\[(.*?)\]/g;
  const listRegex =
    /(Stealth|\bLeader\b|Deep Strike|Infiltrators|Deadly Demise \d+|Deadly Demise D\d+|Scouts \d+"|Fights First|Lone Operative|Feel No Pain \d+\+)/g;
  const matches = inputString.match(keywordRegex) || [];
  const listMatches = inputString.match(listRegex) || [];

  const components = [];
  let currentIndex = 0;
  let remainingText = inputString;

  matches?.forEach((match, index) => {
    const keyword = match.slice(1, -1);
    const startIndex = remainingText.indexOf(match);
    const endIndex = startIndex + match.length;
    const textBefore = remainingText.slice(0, startIndex);
    remainingText = remainingText.slice(endIndex);
    components.push(
      <React.Fragment key={`keyword-${index}`}>
        {textBefore}
        <span className="keyword">
          <KeywordTooltip keyword={keyword.toLowerCase()} />
        </span>
      </React.Fragment>
    );
  });

  listMatches?.forEach((match, index) => {
    const startIndex = remainingText.indexOf(match);
    const endIndex = startIndex + match.length;
    const textBefore = remainingText.slice(0, startIndex);
    remainingText = remainingText.slice(endIndex);
    components.push(
      <React.Fragment key={`rule-${index}`}>
        {textBefore}
        <span className="rule">
          <RuleTooltip keyword={match.toLowerCase()} />
        </span>
      </React.Fragment>
    );
  });

  if (remainingText.length > 0) {
    components.push(remainingText);
  }
  return components.map((component, index) => {
    // Check if the component has children and if it's a string

    if (typeof component === "string") {
      // Replace "■" with newline components
      if (component.includes("■")) {
        return component.split("■").map((segment, i) => (
          <React.Fragment key={i}>
            {<MarkdownSpanWrapDisplay content={segment} />}
            {i !== component.split("■").length - 1 && (
              <>
                <br /> ■
              </>
            )}
          </React.Fragment>
        ));
      }
      return <MarkdownSpanWrapDisplay content={component} key={index} />;
    } else if (React.isValidElement(component) && typeof component.props.children === "string") {
      // Replace "■" with newline components
      if (component.props.children.includes("■")) {
        const newChildren = component.props.children.split("■").map((segment, i) => (
          <React.Fragment key={i}>
            {<MarkdownSpanWrapDisplay content={segment} />}
            {i !== component.props.children.split("■").length - 1 && (
              <>
                <br /> ■
              </>
            )}
          </React.Fragment>
        ));

        // Clone the component with the new children
        return React.cloneElement(component, { ...component.props, key: index, children: newChildren });
      }

      const newChildren = <MarkdownSpanWrapDisplay content={component.props.children} />;
      return React.cloneElement(component, { ...component.props, key: index, children: newChildren });
    } else if (React.isValidElement(component) && component.props.children.length > 0) {
      // Loop over all children and check if they are strings
      const newChildren = component.props.children.map((child, i) => {
        console.log(child);
        // Replace "■" with newline components
        if (typeof child === "string" && child.includes("■")) {
          return child.split("■").map((segment, j) => (
            <React.Fragment key={j}>
              {<MarkdownSpanWrapDisplay content={segment} />}
              {j !== child.split("■").length - 1 && (
                <>
                  <br /> ■
                </>
              )}
            </React.Fragment>
          ));
        }
        // if it doesnt containt a newline character, return as a MarkDownSpanDisplay
        if (typeof child === "string") {
          return <MarkdownSpanWrapDisplay content={child} key={i} />;
        }

        // Return the component as is if it doesn't meet the criteria
        return child;
      });

      return React.cloneElement(component, { ...component.props, key: index, children: newChildren });
    }

    // Return the component as is if it doesn't meet the criteria
    return component;
  });
}

export const UnitAbilityDescription = ({ name, description, showDescription }) => {
  return (
    <div className="ability">
      <span className="name">{name}</span>
      {showDescription && <span className="description">{replaceKeywords(description)}</span>}
    </div>
  );
};
