import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import "./GlossaryList.css";

// Human-readable labels for each glossary scope.
const SCOPE_LABELS = {
  weapons: "Weapons",
  abilities: "Abilities",
  "unit-keywords": "Unit Keywords",
  rules: "Rules",
  stratagems: "Stratagems",
  enhancements: "Enhancements",
};

// Render a glossary description, preserving the newline-separated lines
// (often bulleted with "•") that entries are authored with.
const GlossaryDescription = ({ description }) => (
  <div className="glossary-description">
    {String(description || "")
      .split("\n")
      .map((line, i) => (
        <p key={i}>{line}</p>
      ))}
  </div>
);

const GlossaryEntry = ({ entry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const scopes = Array.isArray(entry.appliesTo) ? entry.appliesTo : [];

  return (
    <div className={`glossary-entry ${isOpen ? "open" : ""}`}>
      <button className="glossary-entry-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="glossary-entry-name">
          {entry.name}
          {entry.matchType === "prefix" && <span className="glossary-entry-prefix">…</span>}
        </span>
        <span className="glossary-entry-scopes">
          {scopes.map((scope) => (
            <span key={scope} className="glossary-scope-chip">
              {SCOPE_LABELS[scope] || scope}
            </span>
          ))}
        </span>
        <ChevronDown size={18} className={`glossary-entry-chevron ${isOpen ? "open" : ""}`} />
      </button>
      {isOpen && (
        <div className="glossary-entry-content">
          <GlossaryDescription description={entry.description} />
        </div>
      )}
    </div>
  );
};

/**
 * Presentational, searchable list of keyword glossary entries. Shared by the
 * mobile glossary page and the desktop middle-panel glossary view; callers
 * supply their own surrounding chrome (header, back button, etc.).
 */
export const GlossaryList = ({ glossary, searchPlaceholder = "Search keywords" }) => {
  const [searchText, setSearchText] = useState("");
  const entries = Array.isArray(glossary) ? glossary : [];

  const filteredEntries = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const sorted = [...entries].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (!query) return sorted;
    return sorted.filter(
      (entry) =>
        (entry.name || "").toLowerCase().includes(query) || (entry.description || "").toLowerCase().includes(query),
    );
  }, [entries, searchText]);

  return (
    <>
      <div className="glossary-search">
        <Search size={16} className="glossary-search-icon" />
        <input
          type="text"
          className="glossary-search-input"
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="glossary-list">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => <GlossaryEntry key={entry.key} entry={entry} />)
        ) : (
          <div className="glossary-empty">
            {entries.length === 0 ? "This datasource has no glossary entries yet." : "No keywords match your search."}
          </div>
        )}
      </div>
    </>
  );
};
