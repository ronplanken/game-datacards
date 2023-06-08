export class BaseCard {
  name = "";

  equal(other) {
    if (other == null) return false;
    return this.name === other.name;
  }
}

export const CardType = {
  DATASHEET: "datasheet",
  STRATAGEM: "stratagem",
  SECONDARY: "secondary",
};

export class StatSheet extends BaseCard {
  m = 4;
  t = 4;
  sv = 4;
  w = 1;
  ld = 1;
  oc = 0;
  invul = 0;
  active = true;
}

export class DataCard extends BaseCard {
  id = 0;

  description = "";

  faction_id = "unknown";
  factionKeywords = new Set();
  keywords = new Set();

  statSheets = [];

  rangedWeapons = [];
  meleeWeapons = [];
  wargear = [];
  abilities = [];
}
