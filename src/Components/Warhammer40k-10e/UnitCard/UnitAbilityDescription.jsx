import React from "react";
import { KeywordTooltip } from "./KeywordTooltip";
import { RuleTooltip } from "./RuleTooltip";
import { MarkdownSpanWrapDisplay } from "../../MarkdownSpanWrapDisplay";
const RULE_KEYWORDS = [
  "feel no pain",
  "leader",
  "deadly demise",
  "deep strike",
  "firing deck",
  "scouts",
  "fights first",
  "infiltrators",
  "stealth",
  "lone operative",
];

function isRuleKeyword(keyword) {
  const kw = keyword.toLowerCase();
  return RULE_KEYWORDS.some((rule) => kw.includes(rule));
}

export function replaceKeywords(inputString) {
  if (!inputString) {
    return;
  }
  const bracketRegex = /\[(.*?)\]/g;
  const ruleRegex =
    /(Stealth|\bLeader\b|Deep Strike|Infiltrators|Deadly Demise \d+|Firing Deck \d+|Deadly Demise D\d+|Scouts \d+"|Fights First|Lone Operative|Feel No Pain \d+\+)/g;
  const weaponKeywordRegex =
    /(Sustained Hits \d+|Lethal Hits|Devastating Wounds|Anti-.+? \d+\+|Torrent|Blast|Rapid Fire \d+|Twin-linked|Hazardous|Melta \d+|Lance|Ignores Cover|Indirect Fire|Precision|Extra Attacks|Psychic|One Shot|Linked Fire)/g;

  // Collect all matches with their positions and types
  const allMatches = [];
  let m;
  while ((m = bracketRegex.exec(inputString)) !== null) {
    allMatches.push({ type: "bracket", keyword: m[1], start: m.index, end: m.index + m[0].length });
  }
  while ((m = ruleRegex.exec(inputString)) !== null) {
    allMatches.push({ type: "rule", keyword: m[0], start: m.index, end: m.index + m[0].length });
  }
  while ((m = weaponKeywordRegex.exec(inputString)) !== null) {
    allMatches.push({ type: "weapon", keyword: m[0], start: m.index, end: m.index + m[0].length });
  }

  // Sort by position, then prefer bracket matches over others at the same position
  allMatches.sort((a, b) => a.start - b.start || (a.type === "bracket" ? -1 : 1));

  // Remove overlapping matches (keep the first/prioritized one)
  const filteredMatches = [];
  let lastEnd = 0;
  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      filteredMatches.push(match);
      lastEnd = match.end;
    }
  }

  // Build components in a single pass
  const components = [];
  let currentPos = 0;

  filteredMatches.forEach((match, index) => {
    const textBefore = inputString.slice(currentPos, match.start);
    // For bracket matches, check inner content to decide weapon vs rule style
    const useWeaponStyle = match.type === "weapon" || (match.type === "bracket" && !isRuleKeyword(match.keyword));

    if (useWeaponStyle) {
      components.push(
        <React.Fragment key={`weapon-${index}`}>
          {textBefore}
          <span className="keyword">
            <KeywordTooltip keyword={match.keyword.toLowerCase()} />
          </span>
        </React.Fragment>,
      );
    } else {
      components.push(
        <React.Fragment key={`rule-${index}`}>
          {textBefore}
          <span className="rule">
            <RuleTooltip keyword={match.keyword.toLowerCase()} />
          </span>
        </React.Fragment>,
      );
    }
    currentPos = match.end;
  });

  if (currentPos < inputString.length) {
    components.push(inputString.slice(currentPos));
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
