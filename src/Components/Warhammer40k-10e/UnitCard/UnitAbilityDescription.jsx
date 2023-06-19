import React from "react";
import { KeywordTooltip } from "./KeywordTooltip";
import { RuleTooltip } from "./RuleTooltip";
export function replaceKeywords(inputString) {
  const keywordRegex = /\[(.*?)\]/g;
  const listRegex =
    /(Stealth|Leader|Deep Strike|Infiltrators|Deadly Demise \d+|Deadly Demise D\d+|Scouts \d+"|Fights First|Lone Operative|Feel No Pain \d+\+)/g;
  const matches = inputString.match(keywordRegex) || [];
  const listMatches = inputString.match(listRegex) || [];

  const components = [];
  let currentIndex = 0;
  let remainingText = inputString;

  matches.forEach((match, index) => {
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

  listMatches.forEach((match, index) => {
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

  return components;
}

export const UnitAbilityDescription = ({ name, description, showDescription }) => {
  return (
    <div className="ability">
      <span className="name">{name}</span>
      {showDescription && <span className="description">{replaceKeywords(description)}</span>}
    </div>
  );
};
