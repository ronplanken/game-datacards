import { useState } from "react";
import * as ReactDOM from "react-dom";
import { AlertCircle } from "lucide-react";
import { message } from "../../Toast/message";
import { v4 as uuidv4 } from "uuid";
import Fuse from "fuse.js";
import {
  parseGwAppText,
  matchFaction,
  matchUnitsToDatasheets,
  countMatchStatuses,
  getImportableUnits,
  filterCardWeapons,
} from "../../../Helpers/gwAppImport.helpers";
import { useUmami } from "../../../Hooks/useUmami";
import { ImportReviewPanel } from "../ImportReviewPanel";

const matchEnhancementsToFaction = (units, faction, listDetachment) => {
  if (!faction?.enhancements?.length) return units;

  return units.map((unit) => {
    if (!unit.enhancement) return unit;

    const enhancements = faction.enhancements;
    let factionEnhancement = null;

    if (listDetachment) {
      factionEnhancement = enhancements.find(
        (e) =>
          e.name.toLowerCase() === unit.enhancement.name.toLowerCase() &&
          e.detachment?.toLowerCase() === listDetachment.toLowerCase(),
      );
    }

    if (!factionEnhancement) {
      factionEnhancement = enhancements.find((e) => e.name.toLowerCase() === unit.enhancement.name.toLowerCase());
    }

    if (!factionEnhancement) {
      const enhancementFuse = new Fuse(enhancements, {
        keys: ["name"],
        threshold: 0.4,
        includeScore: true,
      });
      const results = enhancementFuse.search(unit.enhancement.name);
      if (results.length > 0) {
        factionEnhancement = results[0].item;
      }
    }

    if (factionEnhancement) {
      return {
        ...unit,
        enhancement: {
          ...unit.enhancement,
          ...factionEnhancement,
          cost: unit.enhancement.cost || factionEnhancement.cost,
          matched: true,
        },
        detachment: factionEnhancement.detachment,
      };
    }

    return unit;
  });
};

const buildCardsFromUnits = (units) => {
  return units.map((unit) => {
    let card = { ...unit.matchedCard };
    card.uuid = uuidv4();
    card.isCustom = true;

    if (unit.points) {
      card.unitSize = {
        ...(card.unitSize || {}),
        cost: unit.points - (unit.enhancement?.cost || 0),
        models: unit.models || 1,
      };
    }

    if (unit.isWarlord) {
      card.isWarlord = true;
    }

    if (unit.enhancement) {
      card.selectedEnhancement = {
        name: unit.enhancement.name,
        cost: unit.enhancement.cost || 0,
        ...(unit.enhancement.matched ? unit.enhancement : {}),
      };
      if (unit.detachment) {
        card.detachment = unit.detachment;
      }
    }

    if (unit.weapons?.length && !card._directRead) {
      card = filterCardWeapons(card, unit.weapons);
    }

    return card;
  });
};

export const GwAppTab = ({ dataSource, settings, importCategory, onClose, footerNode }) => {
  const [gwAppText, setGwAppText] = useState("");
  const [phase, setPhase] = useState("paste");
  const [error, setError] = useState(null);
  const [parsedFaction, setParsedFaction] = useState(null);
  const [matchedFaction, setMatchedFaction] = useState(null);
  const [units, setUnits] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  const { trackEvent } = useUmami();
  const factionOptions = dataSource?.data?.map((f) => ({ value: f.id, label: f.name })) || [];

  const handleParse = () => {
    setError(null);

    const parsed = parseGwAppText(gwAppText);

    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    if (!parsed.units.length) {
      setError("No units found in the list");
      return;
    }

    setParsedFaction(parsed.factionName);

    const factionMatch = matchFaction(parsed.factionName, dataSource?.data || []);
    setMatchedFaction(factionMatch.matchedFaction);

    const name = parsed.listName || parsed.factionName || "Imported List";

    if (factionMatch.matchedFaction) {
      let matchedUnits = matchUnitsToDatasheets(parsed.units, factionMatch.matchedFaction, dataSource?.data || []);
      matchedUnits = matchEnhancementsToFaction(matchedUnits, factionMatch.matchedFaction, parsed.detachment);
      setUnits(matchedUnits);
      setCategoryName(name);
    } else {
      setUnits(parsed.units.map((u) => ({ ...u, matchStatus: "none", matchedCard: null, alternatives: [] })));
      setCategoryName(name);
    }

    setPhase("review");
  };

  const handleFactionChange = (factionId) => {
    const faction = dataSource?.data?.find((f) => f.id === factionId);
    if (faction) {
      setMatchedFaction(faction);
      const parsed = parseGwAppText(gwAppText);
      let matchedUnits = matchUnitsToDatasheets(parsed.units, faction, dataSource?.data || []);
      matchedUnits = matchEnhancementsToFaction(matchedUnits, faction, parsed.detachment);
      setUnits(matchedUnits);
    }
  };

  const handleUnitChange = (unitIndex, datasheetId) => {
    const datasheet = matchedFaction?.datasheets?.find((d) => d.id === datasheetId);
    if (datasheet) {
      setUnits((prev) =>
        prev.map((unit, idx) =>
          idx === unitIndex ? { ...unit, matchedCard: datasheet, matchStatus: "confident", skipped: false } : unit,
        ),
      );
    }
  };

  const handleUnitSkip = (unitIndex) => {
    setUnits((prev) => prev.map((unit, idx) => (idx === unitIndex ? { ...unit, skipped: !unit.skipped } : unit)));
  };

  const handleBack = () => {
    setPhase("paste");
    setError(null);
  };

  const handleImport = () => {
    const importableUnits = getImportableUnits(units);

    if (!importableUnits.length) {
      message.error("No units to import");
      return;
    }

    const cards = buildCardsFromUnits(importableUnits);

    const category = {
      uuid: uuidv4(),
      name: categoryName || "Imported List",
      type: "list",
      dataSource: settings.selectedDataSource,
      cards,
    };

    importCategory(category);
    trackEvent("import-gw-list", { faction: matchedFaction?.name, unitCount: cards.length });
    message.success(`Imported ${cards.length} units to "${category.name}"`);
    onClose();
  };

  const matchCounts = countMatchStatuses(units);
  const importableCount = getImportableUnits(units).length;

  return (
    <>
      {phase === "paste" && (
        <div className="gw-import-container">
          <p className="import-export-description">
            Paste your army list from the GW Warhammer 40k app or any compatible text format.
          </p>
          <textarea
            className="gw-import-textarea"
            value={gwAppText}
            onChange={(e) => setGwAppText(e.target.value)}
            placeholder={`Blood Angels\n\nCHARACTERS\n\nCaptain (120 pts)\n   • Warlord\n\nBATTLELINE\n\nAssault Intercessors 5x (75 pts)\n\nCreated with https://game-datacards.eu`}
          />
          {error && (
            <div className="gw-import-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          <div className="gw-import-actions">
            <button className="gw-import-parse-btn" onClick={handleParse} disabled={!gwAppText.trim()}>
              Parse List
            </button>
          </div>
        </div>
      )}

      {phase === "review" && (
        <ImportReviewPanel
          parsedFaction={parsedFaction}
          matchedFaction={matchedFaction}
          units={units}
          categoryName={categoryName}
          matchCounts={matchCounts}
          importableCount={importableCount}
          factionOptions={factionOptions}
          onFactionChange={handleFactionChange}
          onUnitChange={handleUnitChange}
          onUnitSkip={handleUnitSkip}
          onCategoryNameChange={setCategoryName}
          onBack={handleBack}
          backLabel="Back to paste"
        />
      )}

      {/* Footer button rendered via portal into parent's footer slot */}
      {phase === "review" &&
        footerNode &&
        ReactDOM.createPortal(
          <button className="ie-btn-primary" onClick={handleImport} disabled={importableCount === 0}>
            Import {importableCount} Unit{importableCount !== 1 ? "s" : ""}
          </button>,
          footerNode,
        )}
    </>
  );
};
