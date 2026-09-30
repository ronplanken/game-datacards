import React from "react";
import classNames from "classnames";
import { ArrowRight, ChevronRight } from "lucide-react";
import { formatChangePath, formatChangeValue } from "../../Helpers/cardUpdates.helpers";
import { localize } from "../../Helpers/localization.helpers";
import "../TreeView/UnitConfigModal.css";
import "./DatasourceUpdates.css";

export const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

const ChangeRow = ({ change, language }) => {
  const path = formatChangePath(change.path);
  if (change.kind === "added") {
    return (
      <li className="dsu-change">
        <span className="dsu-path">{path}</span>
        <span className="dsu-values">
          <span className="dsu-tag dsu-tag--added">Added</span>
          <span className="dsu-after">{formatChangeValue(change.after, language)}</span>
        </span>
      </li>
    );
  }
  if (change.kind === "removed") {
    return (
      <li className="dsu-change">
        <span className="dsu-path">{path}</span>
        <span className="dsu-values">
          <span className="dsu-tag dsu-tag--removed">Removed</span>
          <span className="dsu-before">{formatChangeValue(change.before, language)}</span>
        </span>
      </li>
    );
  }
  return (
    <li className="dsu-change">
      <span className="dsu-path">{path}</span>
      <span className="dsu-values">
        <span className="dsu-before">{formatChangeValue(change.before, language)}</span>
        <ArrowRight size={12} className="dsu-arrow" />
        <span className="dsu-after">{formatChangeValue(change.after, language)}</span>
      </span>
    </li>
  );
};

export const DatasourceUpdatesBody = ({ state, language = "en" }) => {
  const {
    results,
    changed,
    notFound,
    unavailable,
    upToDate,
    selected,
    expanded,
    allSelected,
    toggleSelected,
    toggleExpanded,
    toggleAll,
  } = state;
  const cardName = (card) => localize(card?.name, language) || "Unnamed card";
  const comparable = results.length - unavailable.length;

  return (
    <>
      <p className="dsu-summary" data-testid="dsu-summary">
        {comparable === 0
          ? "None of these cards can be compared with the datasource that is loaded now."
          : changed.length === 0
            ? `${plural(upToDate.length, "card")} ${upToDate.length === 1 ? "matches" : "match"} the loaded datasource.`
            : `${plural(changed.length, "card")} ${changed.length === 1 ? "differs" : "differ"} from the loaded datasource.`}
      </p>

      {changed.length > 0 && (
        <div>
          <div className="ucm-section-label dsu-section-label">
            Differences
            <button type="button" className="dsu-link" onClick={toggleAll}>
              {allSelected ? "Select none" : "Select all"}
            </button>
          </div>
          <ul className="dsu-card-list">
            {changed.map((result) => {
              const uuid = result.card.uuid;
              const isSelected = selected.has(uuid);
              const isExpanded = expanded.has(uuid);
              return (
                <li key={uuid} className={classNames("dsu-card", { selected: isSelected })}>
                  <div className="dsu-card-header">
                    <button
                      type="button"
                      className="dsu-check"
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={`Update ${cardName(result.card)}`}
                      onClick={() => toggleSelected(uuid)}>
                      <span className={classNames("ucm-radio", { checked: isSelected })} />
                    </button>
                    <button
                      type="button"
                      className="dsu-card-toggle"
                      aria-expanded={isExpanded}
                      onClick={() => toggleExpanded(uuid)}>
                      <span className="dsu-card-name">{cardName(result.card)}</span>
                      {result.matchedBy === "name" && <span className="dsu-card-badge">Matched by name</span>}
                      <span className="dsu-card-count">{plural(result.changes.length, "change")}</span>
                      <ChevronRight size={14} className={classNames("dsu-chevron", { open: isExpanded })} />
                    </button>
                  </div>
                  {isExpanded && (
                    <ul className="dsu-change-list">
                      <li className="dsu-change dsu-change--legend">
                        <span className="dsu-path">Field</span>
                        <span className="dsu-values">Your card, then the datasource</span>
                      </li>
                      {result.changes.map((change, index) => (
                        <ChangeRow key={index} change={change} language={language} />
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="dsu-note">
            Updating replaces the card content (stats, weapons, abilities, keywords, points and text) with the
            datasource version. Unit size, warlord, enhancement, wargear, attached leaders, hidden weapons and
            abilities, and card styling are kept. Other edits you made to the card content are replaced. You can undo
            this right after updating.
          </p>
        </div>
      )}

      {notFound.length > 0 && (
        <div>
          <div className="ucm-section-label">Not found in the datasource</div>
          <p className="dsu-note">
            These cards were removed from the datasource, got a new id, or were created by hand.
          </p>
          <ul className="dsu-name-list">
            {notFound.map((result) => (
              <li key={result.card.uuid}>{cardName(result.card)}</li>
            ))}
          </ul>
        </div>
      )}

      {unavailable.length > 0 && (
        <p className="dsu-note" data-testid="dsu-unavailable">
          {plural(unavailable.length, "card")} could not be compared because{" "}
          {unavailable.length === 1 ? "it belongs" : "they belong"} to another datasource or{" "}
          {unavailable.length === 1 ? "has" : "have"} no datasource id. Switch to that datasource to compare{" "}
          {unavailable.length === 1 ? "it" : "them"}.
        </p>
      )}

      {changed.length > 0 && upToDate.length > 0 && (
        <p className="dsu-note">
          {plural(upToDate.length, "card")} already {upToDate.length === 1 ? "matches" : "match"} the datasource.
        </p>
      )}
    </>
  );
};
