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

function isPartOfPhrase(text, matchStart) {
  if (matchStart > 0) {
    const textBefore = text.slice(0, matchStart);
    if (/[A-Z][a-z]+\s$/.test(textBefore)) {
      return true;
    }
  }
  return false;
}

export function replaceKeywords(inputString) {
  if (!inputString) {
    return;
  }

  // Step 1: Extract escaped keywords (\Word) and replace with placeholders
  const escapeRegex = /\\([A-Za-z]\w*)/g;
  const escapedSegments = [];
  let processedString = inputString.replace(escapeRegex, (match, word) => {
    const placeholder = `\x00ESC${escapedSegments.length}\x00`;
    escapedSegments.push(word);
    return placeholder;
  });

  const bracketRegex = /\[(.*?)\]/g;
  const ruleRegex =
    /(\bStealth\b|\bLeader\b|\bDeep Strike\b|\bInfiltrators\b|\bDeadly Demise \d*D?\d+(?:\+\d+)?\b|\bFiring Deck \d+\b|\bScouts \d+"|\bFights First\b|\bLone Operative\b|\bFeel No Pain \d+\+)/g;
  const weaponKeywordRegex =
    /(\bSustained Hits \d+\b|\bLethal Hits\b|\bDevastating Wounds\b|\bAnti-.+? \d+\+|\bTorrent\b|\bBlast\b|\bRapid Fire \d+\b|\bTwin-linked\b|\bHazardous\b|\bMelta \d+\b|\bLance\b|\bIgnores Cover\b|\bIndirect Fire\b|\bPrecision\b|\bExtra Attacks\b|\bPsychic\b|\bOne Shot\b|\bLinked Fire\b)/g;

  // Collect all matches with their positions and types
  const allMatches = [];
  let m;
  while ((m = bracketRegex.exec(processedString)) !== null) {
    allMatches.push({ type: "bracket", keyword: m[1], start: m.index, end: m.index + m[0].length });
  }
  while ((m = ruleRegex.exec(processedString)) !== null) {
    if (!isPartOfPhrase(processedString, m.index)) {
      allMatches.push({ type: "rule", keyword: m[0], start: m.index, end: m.index + m[0].length });
    }
  }
  while ((m = weaponKeywordRegex.exec(processedString)) !== null) {
    if (!isPartOfPhrase(processedString, m.index)) {
      allMatches.push({ type: "weapon", keyword: m[0], start: m.index, end: m.index + m[0].length });
    }
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
    const textBefore = processedString.slice(currentPos, match.start);
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

  if (currentPos < processedString.length) {
    components.push(processedString.slice(currentPos));
  }

  // Restore escaped segments (render without backslash, no keyword styling)
  const restorePlaceholders = (str) => {
    if (typeof str !== "string") return str;
    return escapedSegments.reduce((s, word, i) => s.replace(`\x00ESC${i}\x00`, word), str);
  };

  return components.map((component, index) => {
    if (typeof component === "string") {
      component = restorePlaceholders(component);
    }
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
      const restoredChildren = restorePlaceholders(component.props.children);
      // Replace "■" with newline components
      if (restoredChildren.includes("■")) {
        const newChildren = restoredChildren.split("■").map((segment, i) => (
          <React.Fragment key={i}>
            {<MarkdownSpanWrapDisplay content={segment} />}
            {i !== restoredChildren.split("■").length - 1 && (
              <>
                <br /> ■
              </>
            )}
          </React.Fragment>
        ));

        // Clone the component with the new children
        return React.cloneElement(component, { ...component.props, key: index, children: newChildren });
      }

      const newChildren = <MarkdownSpanWrapDisplay content={restoredChildren} />;
      return React.cloneElement(component, { ...component.props, key: index, children: newChildren });
    } else if (React.isValidElement(component) && component.props.children.length > 0) {
      // Loop over all children and check if they are strings
      const newChildren = component.props.children.map((child, i) => {
        const restoredChild = restorePlaceholders(child);
        // Replace "■" with newline components
        if (typeof restoredChild === "string" && restoredChild.includes("■")) {
          return restoredChild.split("■").map((segment, j) => (
            <React.Fragment key={j}>
              {<MarkdownSpanWrapDisplay content={segment} />}
              {j !== restoredChild.split("■").length - 1 && (
                <>
                  <br /> ■
                </>
              )}
            </React.Fragment>
          ));
        }
        // if it doesnt containt a newline character, return as a MarkDownSpanDisplay
        if (typeof restoredChild === "string") {
          return <MarkdownSpanWrapDisplay content={restoredChild} key={i} />;
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
