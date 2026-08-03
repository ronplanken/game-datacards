import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { FactionIcon } from "../../Icons/FactionIcon";

// 11th edition datasheets reference factions by UUID, but the shared FactionIcon
// fetches `<code>.svg` using the legacy short codes. Resolve the symbol from the
// human-readable faction name(s) instead. Falls back to no symbol when unknown.
const NAME_TO_CODE = {
  "adeptus custodes": "AC",
  "adeptus titanicus": "AT",
  aeldari: "AE",
  "agents of the imperium": "AoI",
  "imperial agents": "AoI",
  agents: "AoI",
  "alpha legion": "LGAL",
  "astra militarum": "AM",
  "adepta sororitas": "AS",
  "adeptus mechanicus": "AdM",
  "blood angels": "CHBA",
  "black legion": "LGBL",
  "black templar": "CHBT",
  "black templars": "CHBT",
  "chaos daemons": "CD",
  "chaos knights": "QT",
  "chaos space marines": "CSM",
  "dark angels": "CHDA",
  "death guard": "DG",
  deathwatch: "CHDW",
  drukhari: "DRU",
  "emperor's children": "LGEC",
  "emperors children": "LGEC",
  "genestealer cult": "GC",
  "genestealer cults": "GC",
  "grey knights": "GK",
  harlequins: "HAR",
  "imperial fists": "CHIF",
  "iron hands": "CHIH",
  "imperial knights": "QI",
  "iron warriors": "LGIW",
  "leagues of votann": "LoV",
  necrons: "NEC",
  "night lords": "LGNL",
  orks: "ORK",
  "red corsairs": "LGRC",
  "raven guard": "CHRG",
  salamanders: "CHSA",
  "space marines": "SM",
  "adeptus astartes": "SM",
  "space wolves": "CHSW",
  "t'au empire": "TAU",
  tau: "TAU",
  "thousand sons": "TS",
  tyranids: "TYR",
  ultramarines: "CHUL",
  "word bearers": "LGWB",
  "world eaters": "WE",
  "white scars": "CHWS",
};

export const resolveFactionCode = (names) => {
  for (const name of names) {
    if (!name) continue;
    const code = NAME_TO_CODE[name.toLowerCase().trim()];
    if (code) return code;
  }
  return null;
};

export const UnitFactionSymbol = ({ unit }) => {
  const { dataSource } = useDataSourceStorage();
  const faction = dataSource?.data?.find((f) => f.id === unit?.faction_id);
  // Prefer the most specific (last) subfaction keyword, then the parent faction.
  const candidates = [...(unit?.factions ? [...unit.factions].reverse() : []), faction?.name];
  const code = resolveFactionCode(candidates);

  if (!code) {
    return <div className="faction" />;
  }

  return (
    <div className="faction">
      <div className="faction-symbol-wrapper">
        <FactionIcon factionId={code} />
      </div>
    </div>
  );
};
