import React from "react";
import { buildFactionIconCandidates, factionNamesFromCard } from "../../../Helpers/factionSymbol.helpers";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { CustomFactionSymbol, useCustomFactionSymbolUrl } from "../../Icons/CustomFactionSymbol";
import { FactionIcon } from "../../Icons/FactionIcon";

// 11th edition datasheets reference factions by UUID, while faction symbols are
// addressed by the legacy short codes. The code is therefore resolved from the
// human-readable faction name(s) - see Helpers/factionSymbol.helpers.
export const UnitFactionSymbol = ({ unit }) => {
  const { dataSource } = useDataSourceStorage();
  const customSymbolUrl = useCustomFactionSymbolUrl(unit);

  // A locally uploaded symbol takes priority over an external URL.
  const symbolUrl = customSymbolUrl || unit?.externalFactionSymbol;
  if (unit?.hasCustomFactionSymbol && symbolUrl) {
    return (
      <div className="faction">
        <CustomFactionSymbol card={unit} imageUrl={symbolUrl} />
      </div>
    );
  }

  const faction = dataSource?.data?.find((f) => f.id === unit?.faction_id);
  // Prefer the most specific (last) subfaction keyword, then the parent faction.
  const candidates = buildFactionIconCandidates({
    factionId: unit?.faction_id,
    names: [...factionNamesFromCard(unit), faction?.name],
  });

  if (candidates.length === 0) {
    return <div className="faction" />;
  }

  return (
    <div className="faction">
      <div className="faction-symbol-wrapper">
        <FactionIcon factionId={candidates} />
      </div>
    </div>
  );
};
