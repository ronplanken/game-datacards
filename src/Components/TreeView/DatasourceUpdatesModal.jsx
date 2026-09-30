import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";
import { ArrowRight, ChevronRight, X } from "lucide-react";
import {
  CARD_UPDATE_STATUS,
  buildDatasourceCardIndex,
  checkCardsForUpdates,
  formatChangePath,
  formatChangeValue,
} from "../../Helpers/cardUpdates.helpers";
import { localize } from "../../Helpers/localization.helpers";
import "./UnitConfigModal.css";
import "./DatasourceUpdatesModal.css";

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

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

export const DatasourceUpdatesModal = ({
  isOpen,
  onClose,
  title = "Compare with datasource",
  cards = [],
  dataSource,
  selectedDataSource,
  language = "en",
  onApply,
}) => {
  const results = useMemo(() => {
    if (!isOpen) return [];
    return checkCardsForUpdates(cards, buildDatasourceCardIndex(dataSource, selectedDataSource), language);
  }, [isOpen, cards, dataSource, selectedDataSource, language]);

  const changed = results.filter((result) => result.status === CARD_UPDATE_STATUS.CHANGED);
  const notFound = results.filter((result) => result.status === CARD_UPDATE_STATUS.NOT_FOUND);
  const unavailable = results.filter((result) => result.status === CARD_UPDATE_STATUS.UNAVAILABLE);
  const upToDate = results.filter((result) => result.status === CARD_UPDATE_STATUS.UP_TO_DATE);

  const initialSelection = () => new Set(changed.map((result) => result.card.uuid));
  const initialExpanded = () => (changed.length === 1 ? new Set([changed[0].card.uuid]) : new Set());
  const [selected, setSelected] = useState(initialSelection);
  const [expanded, setExpanded] = useState(initialExpanded);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(initialSelection());
    setExpanded(initialExpanded());
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggle = (setter) => (uuid) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  const toggleSelected = toggle(setSelected);
  const toggleExpanded = toggle(setExpanded);

  const allSelected = changed.length > 0 && changed.every((result) => selected.has(result.card.uuid));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(changed.map((result) => result.card.uuid)));

  const selectedCount = changed.filter((result) => selected.has(result.card.uuid)).length;

  const handleApply = () => {
    onApply(
      results,
      changed.filter((result) => selected.has(result.card.uuid)).map((result) => result.card.uuid),
    );
  };

  const cardName = (card) => localize(card?.name, language) || "Unnamed card";
  const comparable = results.length - unavailable.length;

  const modalRoot = document.getElementById("modal-root");

  return ReactDOM.createPortal(
    <div className="ucm-overlay" onClick={onClose} data-testid="dsu-overlay">
      <div className="ucm-modal dsu-modal" onClick={(e) => e.stopPropagation()} data-testid="dsu-modal">
        <div className="ucm-header">
          <h3 className="ucm-title">{title}</h3>
          <button className="ucm-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="ucm-content">
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
                abilities, and card styling are kept. Other edits you made to the card content are lost.
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
        </div>

        <div className="ucm-footer">
          {changed.length > 0 ? (
            <button className="ucm-submit" onClick={handleApply} type="button" disabled={selectedCount === 0}>
              Update {plural(selectedCount, "card")}
            </button>
          ) : (
            <button className="ucm-submit" onClick={onClose} type="button">
              Close
            </button>
          )}
        </div>
      </div>
    </div>,
    modalRoot,
  );
};
