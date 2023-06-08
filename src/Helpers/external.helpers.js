import clone from "just-clone";
import { v4 as uuidv4 } from "uuid";

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function capitalizeSentence(sentence) {
  let words = sentence.toLowerCase().split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }
  return words.join(" ");
}

export function extractWarpChargeValue(text) {
  const pattern = /has a warp charge value of (\d+)/i;
  const match = text.match(pattern);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

const BASIC_CORE_STRATAGEMS = [
  "000002134002",
  "000002134003",
  "000002134004",
  "000002134005",
  "000002134006",
  "000002134007",
  "000002134008",
];

const readCsv = async (file) => {
  if (!file) {
    return;
  }

  return fetch(file)
    .then((response) => response.text())
    .then((text) => JSON.parse(text));
};

export const get40KData = async () => {
  const lastUpdated = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Last_update.json?${new Date().getTime()}`
  );
  const dataDatasheetAbilities = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Datasheets_abilities.json?${new Date().getTime()}`
  );
  const dataStratagems = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Stratagems.json?${new Date().getTime()}`
  );
  const dataAbilities = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Abilities.json?${new Date().getTime()}`
  );
  const dataDatasheetWargear = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Datasheets_wargear.json?${new Date().getTime()}`
  );
  const dataWargearList = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Wargear_list.json?${new Date().getTime()}`
  );
  const dataWargear = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Wargear.json?${new Date().getTime()}`
  );
  const dataModels = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Datasheets_models.json?${new Date().getTime()}`
  );
  const dataKeywords = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Datasheets_keywords.json?${new Date().getTime()}`
  );
  const dataDamage = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Datasheets_damage.json?${new Date().getTime()}`
  );
  const dataFactions = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Factions.json?${new Date().getTime()}`
  );
  const sheets = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Datasheets.json?${new Date().getTime()}`
  );
  const dataSecondaries = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Secondaries.json?${new Date().getTime()}`
  );
  const dataPsychic = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/PsychicPowers.json?${new Date().getTime()}`
  );
  const dataTraits = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/40k/json/Warlord_traits.json?${new Date().getTime()}`
  );

  const mappedPsychicPowers = dataPsychic.map((power) => {
    power["cardType"] = "psychic";
    power["source"] = "40k";
    power["name"] = capitalizeSentence(power.name);
    power["warpcharge"] = extractWarpChargeValue(power["description"]);
    return power;
  });
  const mappedTraits = dataTraits.map((trait) => {
    trait["source"] = "40k";
    trait["name"] = capitalizeSentence(trait.name);
    return trait;
  });

  dataFactions.sort((a, b) => a.name.localeCompare(b.name));

  const mainFactions = dataFactions.filter((faction) => faction.is_subfaction === "false");

  const mappedStratagems = dataStratagems.map((stratagem) => {
    stratagem["cardType"] = "stratagem";
    stratagem["source"] = "40k";
    stratagem["cp_cost"] = `${stratagem["cp_cost"]} CP`;
    stratagem["name"] = capitalizeSentence(stratagem.name);
    if (stratagem.faction_id === stratagem.subfaction_id) {
      stratagem["subfaction_id"] = undefined;
    }
    if (BASIC_CORE_STRATAGEMS.includes(stratagem.id)) {
      stratagem["source_id"] = "core";
      stratagem["faction_id"] = "basic";
    }
    return stratagem;
  });

  const mappedSecondaries = dataSecondaries.map((secondary) => {
    secondary["cardType"] = "secondary";
    secondary["name"] = capitalizeSentence(secondary.name);
    secondary["source"] = "40k";
    secondary["id"] = uuidv4();
    return secondary;
  });

  mappedSecondaries.sort((a, b) => {
    if (a.faction_id !== b.faction_id) {
      return a.faction_id.localeCompare(b.faction_id);
    } else {
      return a.category.localeCompare(b.category);
    }
  });

  const mappedSheets = sheets.map((row) => {
    row["cardType"] = "datasheet";
    row["source"] = "40k";
    row["keywords"] = [
      ...new Map(
        dataKeywords
          .filter((keyword) => keyword.datasheet_id === row.id)
          .map((model) => {
            return { ...model, active: true };
          })
          .map((item) => [item["keyword"], item])
      ).values(),
    ];
    row["datasheet"] = dataModels
      .filter((model) => model.datasheet_id === row.id)
      .filter(onlyUnique)
      .map((model, index) => {
        return { ...model, active: index === 0 ? true : false };
      });

    const linkedDamageTable = dataDamage.filter((damage) => damage.datasheet_id === row.id);
    for (let index = 1; index < linkedDamageTable.length; index++) {
      const cols = linkedDamageTable[0];
      const newRow = {};

      newRow["W"] = linkedDamageTable[index]["Col1"];
      newRow[cols["Col2"]] = linkedDamageTable[index]["Col2"];
      newRow[cols["Col3"]] = linkedDamageTable[index]["Col3"];
      newRow[cols["Col4"]] = linkedDamageTable[index]["Col4"];
      if (cols["Col5"]) {
        newRow[cols["Col5"]] = linkedDamageTable[index]["Col5"];
      }
      newRow["name"] = `Wound profile ${linkedDamageTable[index]["Col1"]}`;
      row["datasheet"].push(newRow);
    }

    const linkedWargear = [
      ...new Map(
        dataDatasheetWargear
          .filter((wargear) => wargear.datasheet_id === row.id && wargear.is_index_wargear === "false")
          .map((item) => [item["wargear_id"], item])
      ).values(),
    ];

    row["wargear"] = [];
    linkedWargear.forEach((wargear, index) => {
      row["wargear"][index] = clone(dataWargear.find((gear) => gear.id === wargear.wargear_id));
      if (row["wargear"][index]) {
        row["wargear"][index]["active"] = index === 0 ? true : false;
        row["wargear"][index]["profiles"] = clone(
          dataWargearList.filter((wargearList) => wargearList.wargear_id === wargear.wargear_id)
        );
      }
    });
    const linkedAbilities = dataDatasheetAbilities.filter((ability) => ability.datasheet_id === row.id);
    row["abilities"] = [];
    linkedAbilities.forEach((ability, index) => {
      row["abilities"].push(dataAbilities.find((abilityInfo) => abilityInfo.id === ability.ability_id));
    });
    row["abilities"] = row["abilities"].map((ability, index) => {
      return {
        ...ability,
        showDescription: false,
        showAbility: index === 0 ? true : false,
      };
    });
    return row;
  });
  mappedSheets.shift();
  mainFactions.map((faction) => {
    faction["subfactions"] = dataFactions.filter((subfaction) => subfaction.parent_id === faction.id);

    faction["datasheets"] = mappedSheets
      .filter((datasheet) => datasheet.faction_id === faction.id)
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    faction["stratagems"] = mappedStratagems
      .filter((stratagem) => stratagem.faction_id === faction.id)
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    faction["basicStratagems"] = mappedStratagems
      .filter((stratagem) => stratagem.faction_id === "basic")
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    faction["psychicpowers"] = mappedPsychicPowers
      .filter((power) => power.faction_id === faction.id)
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    faction["traits"] = mappedTraits
      .filter((trait) => trait.faction_id === faction.id)
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    faction["secondaries"] = mappedSecondaries.filter((secondary) => {
      return secondary.game === "Arks of Omen: Grand Tournament" && secondary.faction_id !== "";
    });

    faction["basicSecondaries"] = mappedSecondaries.filter((secondary) => {
      return secondary.game === "Arks of Omen: Grand Tournament" && secondary.faction_id === "";
    });

    return faction;
  });

  return {
    data: mainFactions,
    version: process.env.REACT_APP_VERSION,
    lastUpdated: lastUpdated[0].last_update,
    lastCheckedForUpdate: new Date().toISOString(),
  };
};

export const getBasicData = () => {
  return {
    version: process.env.REACT_APP_VERSION,
    lastUpdated: new Date().toISOString(),
    lastCheckedForUpdate: new Date().toISOString(),
    noDatasheetOptions: true,
    noStratagemOptions: true,
    noSecondaryOptions: true,
    noPsyhicOptions: true,
    data: [
      {
        id: "basic",
        link: "https://game-datacard.eu",
        name: "Basic Cards",
        datasheets: [
          {
            name: "Basic Card",
            role: "Unknown",
            source: "basic",
            unit_composition: "Basic unit description you can customize to your needs. Empty this field to hide it",
            id: "000000001",
            faction_id: "basic",
            cardType: "datasheet",
            abilities: [
              {
                description: "ability description",
                faction_id: "basic",
                id: "000000101",
                is_other_wargear: "false",
                name: "Basic ability",
                showAbility: true,
                showDescription: false,
                type: "Abilities",
              },
            ],
            keywords: [
              {
                active: true,
                datasheet_id: "000010201",
                is_faction_keyword: "false",
                keyword: "Basic Card",
                model: "Basic Card",
              },
            ],
            datasheet: [
              {
                A: "3",
                BS: "3+",
                Cost: "",
                Ld: "9",
                M: '6"',
                S: "3",
                Sv: "3+",
                T: "3",
                W: "5",
                WS: "3+",
                active: true,
                base_size: "32mm",
                base_size_descr: "",
                cost_description: "",
                cost_including_wargear: "true",
                datasheet_id: "000010101",
                line: "1",
                models_per_unit: "1",
                name: "Basic Card",
              },
            ],
            wargear: [
              {
                active: true,
                description: "",
                faction_id: "AS",
                faction_name: "Basic Wargear Option",
                id: "000010301",
                is_relic: "false",
                legend: "",
                name: "Basic Weapon",
                profiles: [
                  {
                    AP: "0",
                    D: "1",
                    Range: '12"',
                    S: "4",
                    abilities: "",
                    line: "1",
                    name: "Basic Weapon",
                    type: "Pistol 1",
                    wargear_id: "000001135",
                  },
                ],
                source_id: "",
                type: "Ranged Weapons",
              },
            ],
          },
        ],
        stratagems: [
          {
            cardType: "stratagem",
            source: "basic",
            cp_cost: "1",
            description: "This is an example description. You can even use _markdown_ in this text!",
            faction_id: "basic",
            id: "000006084006",
            name: "THE BASIC STRAT",
            type: "Just another stratagem",
          },
        ],
        secondaries: [
          {
            cardType: "secondary",
            category: "Secondary Category",
            description: "This is an example description. You can even use _markdown_ in this text!",
            faction_id: "basic",
            faction_name: "Basic",
            faction_type: "Basic",
            game: "basic",
            id: "af7a5763-107e-472a-9dcd-9a5fd04170fc",
            name: "BASIC SECONDARY",
            source: "basic",
            type: "Progressive Objective",
          },
        ],
        psychicpowers: [
          {
            cardType: "psychic",
            description: "**Description!:** This is an example description. You can even use _markdown_ in this text!",
            faction_id: "basic",
            faction_name: "Basic",
            id: "773a31ed-5d2f-470b-b400-08134d753bbc",
            legend: "",
            name: "PSYCHIC POWER",
            roll: "6",
            source: "basic",
            type: "Basic Discipline",
          },
        ],
      },
    ],
  };
};

export const get40k10eData = async () => {
  const tyranids = await readCsv(
    `https://raw.githubusercontent.com/game-datacards/datasources/main/10th/json/tyranids.json?${new Date().getTime()}`
  );

  return {
    version: process.env.REACT_APP_VERSION,
    lastUpdated: new Date().toISOString(),
    lastCheckedForUpdate: new Date().toISOString(),
    noDatasheetOptions: true,
    noStratagemOptions: true,
    noSecondaryOptions: true,
    noPsychicOptions: true,
    noFactionOptions: true,
    data: [tyranids],
  };
};

export const getNecromundaBasicData = () => {
  return {
    version: process.env.REACT_APP_VERSION,
    lastUpdated: new Date().toISOString(),
    lastCheckedForUpdate: new Date().toISOString(),
    noDatasheetOptions: true,
    noStratagemOptions: true,
    noSecondaryOptions: true,
    noPsyhicOptions: true,
    data: [
      {
        id: "necromunda",
        link: "https://game-datacard.eu",
        name: "Necromunda Gang Cards",
        datasheets: [
          {
            name: "Fighter card",
            type: "Unknown",
            role: "Basic",
            source: "necromunda",
            id: "000000001",
            cost: "100",
            faction_id: "necromunda",
            cardType: "ganger",
            notes: "",
            rules: [
              {
                active: true,
                name: "Rule 1",
                description: "Rule description",
                id: "000010601",
              },
            ],
            skills: [
              {
                active: true,
                name: "Ability 1",
                description: "Ability description",
                id: "000010701",
              },
            ],
            wargear: [
              {
                active: true,
                name: "Gear 1",
                description: "Gear description",
                id: "000010801",
              },
            ],
            weapons: [
              {
                active: true,
                id: "000010301",
                name: "Basic Weapon",
                profiles: [
                  {
                    id: "000010302",
                    name: "Basic Weapon",
                    S: "0",
                    L: "1",
                    S2: '12"',
                    L2: "4",
                    STR: "2",
                    AP: "1",
                    D: "1",
                    AM: "1",
                    traits: [
                      {
                        id: "000010321",
                        active: true,
                        name: "Basic Weapon",
                      },
                    ],
                  },
                ],
              },
            ],
            datasheet: {
              M: "9",
              WS: "2+",
              BS: "2+",
              S: "9",
              T: "9",
              W: "9",
              I: "2+",
              A: "9",
              LD: "9+",
              CL: "9+",
              WIL: "9+",
              INT: "9+",
              EXP: "0",
            },
          },
          {
            name: "Fighter card (for pen & paper)",
            type: "",
            role: "Basic",
            source: "necromunda",
            id: "000000003",
            cost: "",
            faction_id: "necromunda",
            cardType: "empty-ganger",
          },

          {
            name: "Vehicle card",
            type: "Unknown",
            role: "Basic",
            source: "necromunda",
            id: "000000002",
            cost: "100",
            faction_id: "necromunda",
            cardType: "vehicle",
            notes: "",
            rules: [
              {
                active: true,
                name: "Rule 1",
                description: "Rule description",
                id: "000010601",
              },
            ],
            skills: [
              {
                active: true,
                name: "Ability 1",
                description: "Ability description",
                id: "000010701",
              },
            ],
            wargear: [
              {
                active: true,
                name: "Gear 1",
                description: "Gear description",
                id: "000010801",
              },
            ],
            weapons: [
              {
                active: true,
                id: "000010301",
                name: "Basic Weapon",
                profiles: [
                  {
                    id: "000010302",
                    name: "Basic Weapon",
                    S: "0",
                    L: "1",
                    S2: '12"',
                    L2: "4",
                    STR: "2",
                    AP: "1",
                    D: "1",
                    AM: "1",
                    traits: [
                      {
                        id: "000010321",
                        active: true,
                        name: "Basic Weapon",
                      },
                    ],
                  },
                ],
              },
            ],
            datasheet: {
              M: "9",
              FRONT: "2+",
              SIDE: "2+",
              REAR: "2+",
              HP: "2+",
              HND: "2+",
              SV: "2+",
              BS: "2+",
              LD: "9+",
              CL: "9+",
              WIL: "9+",
              INT: "9+",
              EXP: "0",
            },
          },
          {
            name: "Vehicle card (for pen & paper)",
            type: "",
            role: "Basic",
            source: "necromunda",
            id: "000000004",
            cost: "",
            faction_id: "necromunda",
            cardType: "empty-vehicle",
          },
        ],
        stratagems: [
          {
            cardType: "stratagem",
            cost: "cost of action",
            description: "This is an example description. You can even use _markdown_ in this text!",
            faction: "necromunda",
            id: "000006084006",
            name: "The basic action",
            type: "Just another action",
            source: "necromunda",
          },
        ],
      },
    ],
  };
};
