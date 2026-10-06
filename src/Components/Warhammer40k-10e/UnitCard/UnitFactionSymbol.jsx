import React from "react";
import { buildFactionIconCandidates, factionNamesFromCard } from "../../../Helpers/factionSymbol.helpers";
import { CustomFactionSymbol, useCustomFactionSymbolUrl } from "../../Icons/CustomFactionSymbol";
import { FactionIcon } from "../../Icons/FactionIcon";

export const UnitFactionSymbol = ({ unit }) => {
  const customSymbolUrl = useCustomFactionSymbolUrl(unit);

  // Determine the symbol URL (local takes priority over external)
  const symbolUrl = customSymbolUrl || unit?.externalFactionSymbol;

  // If custom symbol is enabled and we have a URL (local or external), render custom
  if (unit?.hasCustomFactionSymbol && symbolUrl) {
    return (
      <div className="faction">
        <CustomFactionSymbol card={unit} imageUrl={symbolUrl} />
      </div>
    );
  }

  // Otherwise render default faction symbol using FactionIcon (print-friendly).
  // 10th edition faction ids are symbol codes; cards from a custom datasource
  // carry a slug instead, so the faction keywords are offered as a fallback.
  const candidates = buildFactionIconCandidates({
    factionId: unit?.faction_id,
    names: factionNamesFromCard(unit),
  });

  return (
    <div className="faction">
      <div className="faction-symbol-wrapper">
        <FactionIcon factionId={candidates} />
      </div>
    </div>
  );
};
