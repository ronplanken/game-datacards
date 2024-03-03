import clone from "just-clone";
import { v4 as uuidv4 } from "uuid";

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export function capitalizeSentence(sentence) {
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
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Last_update.json?${new Date().getTime()}`
  );
  const dataDatasheetAbilities = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Datasheets_abilities.json?${new Date().getTime()}`
  );
  const dataStratagems = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Stratagems.json?${new Date().getTime()}`
  );
  const dataAbilities = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Abilities.json?${new Date().getTime()}`
  );
  const dataDatasheetWargear = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Datasheets_wargear.json?${new Date().getTime()}`
  );
  const dataWargearList = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Wargear_list.json?${new Date().getTime()}`
  );
  const dataWargear = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Wargear.json?${new Date().getTime()}`
  );
  const dataModels = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Datasheets_models.json?${new Date().getTime()}`
  );
  const dataKeywords = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Datasheets_keywords.json?${new Date().getTime()}`
  );
  const dataDamage = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Datasheets_damage.json?${new Date().getTime()}`
  );
  const dataFactions = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Factions.json?${new Date().getTime()}`
  );
  const sheets = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Datasheets.json?${new Date().getTime()}`
  );
  const dataSecondaries = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Secondaries.json?${new Date().getTime()}`
  );
  const dataPsychic = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/PsychicPowers.json?${new Date().getTime()}`
  );
  const dataTraits = await readCsv(
    `${process.env.REACT_APP_DATASOURCE_9TH_URL}/json/Warlord_traits.json?${new Date().getTime()}`
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
      return (
        secondary.game === "Arks of Omen: Grand Tournament" &&
        (secondary.faction_id === faction.id ||
          faction.subfactions.map((subfaction) => subfaction.id).includes(secondary.faction_id))
      );
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
    noDatasheetOptions: false,
    noStratagemOptions: true,
    noSecondaryOptions: true,
    noPsychicOptions: true,
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
  const factions = [
    "worldeaters",
    "deathwatch",
    "deathguard",
    "adeptusmechanicus",
    "chaos_spacemarines",
    "blacktemplar",
    "adeptasororitas",
    "thousandsons",
    "darkangels",
    "chaosdaemons",
    "astramilitarum",
    "chaosknights",
    "space_marines",
    "agents",
    "spacewolves",
    "greyknights",
    "tyranids",
    "adeptuscustodes",
    "imperialknights",
    "bloodangels",
    "orks",
    "votann",
    "tau",
    "necrons",
    "aeldari",
    "drukhari",
    "gsc",
    "unaligned",
  ];

  const fetchData = async (faction) => {
    const url = `${process.env.REACT_APP_DATASOURCE_10TH_URL}/${faction}.json?${new Date().getTime()}`;
    const data = await readCsv(url);
    return data;
  };

  const core = await readCsv(`${process.env.REACT_APP_DATASOURCE_10TH_URL}/core.json?${new Date().getTime()}`);

  const fetchAllData = async () => {
    const sortedFactions = factions.sort();
    const promises = sortedFactions.map((faction) => fetchData(faction));
    const allData = await Promise.all(promises);
    return allData;
  };

  const allFactionsData = await fetchAllData();

  return {
    version: process.env.REACT_APP_VERSION,
    lastUpdated: new Date().toISOString(),
    lastCheckedForUpdate: new Date().toISOString(),
    noDatasheetOptions: false,
    noDatasheetByRole: true,
    noStratagemOptions: false,
    noSubfactionOptions: true,
    noSecondaryOptions: true,
    noPsychicOptions: true,
    noFactionOptions: false,
    data: allFactionsData.map((val) => {
      return {
        ...val,
        stratagems: val?.stratagems?.map((strat) => {
          return { ...strat, cardType: "stratagem", source: "40k-10e" };
        }),
        basicStratagems: core?.stratagems?.map((strat) => {
          return { ...strat, cardType: "stratagem", source: "40k-10e" };
        }),
      };
    }),
  };
};

export const getMessages = async () => {
  const url = `${process.env.REACT_APP_MESSAGES_URL}`;
  const data = await readCsv(url);
  return data;
};

export const getNecromundaBasicData = () => {
  return {
    version: process.env.REACT_APP_VERSION,
    lastUpdated: new Date().toISOString(),
    lastCheckedForUpdate: new Date().toISOString(),
    noDatasheetOptions: true,
    noStratagemOptions: true,
    noSubfactionOptions: true,
    noSecondaryOptions: true,
    noPsychicOptions: true,
    noFactionOptions: true,
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
export const getFullCustomData = () => {
  return {
    version: process.env.REACT_APP_VERSION,
    lastUpdated: new Date().toISOString(),
    lastCheckedForUpdate: new Date().toISOString(),
    noDatasheetOptions: true,
    noStratagemOptions: true,
    noSubfactionOptions: true,
    noSecondaryOptions: true,
    noPsychicOptions: true,
    noFactionOptions: true,
    cardSetup: {
      datasheets: {
        profile: {
          col1: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col2: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col3: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col4: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col5: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col6: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col6: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col7: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col8: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col9: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
          col10: {
            active: true,
            label: "Name",
            shortHand: "N",
            type: "text",
          },
        },
        keywords: {
          showLabel: true,
          showColon: true,
          label: "Keywords",
          type: "text",
        },
        extraKeywords: {
          showLabel: true,
          showColon: true,
          label: "Keywords",
          type: "text",
        },
        abilities: {
          showHeader: true,
          label: "Abilities",
          type1: {
            active: true,
            name: "Core ability",
            showColon: true,
            showLabel: true,
            label: "Core",
            type: "text",
            location: "right-col",
          },
          type2: {
            active: true,
            name: "Faction ability",
            showColon: true,
            showLabel: true,
            label: "Faction",
            type: "text",
            location: "right-col",
          },
          type3: {
            active: true,
            name: "Extended ability",
            showColon: true,
            showLabel: true,
            label: "Faction",
            type: "description",
            location: "right-col",
          },
        },
        weapon1: {
          showHeader: true,
          label: "Melee Weapons",
          icon: "melee",
          col1: {
            active: true,
            label: "Range",
            shortHand: "Range",
            type: "text",
          },
          col2: {
            active: true,
            label: "Attacks",
            shortHand: "A",
            type: "text",
          },
          col3: {
            active: true,
            label: "BS",
            shortHand: "BS",
            type: "text",
          },
          col4: {
            active: true,
            label: "S",
            shortHand: "S",
            type: "text",
          },
          col5: {
            active: true,
            label: "AP",
            shortHand: "AP",
            type: "text",
          },
          col6: {
            active: true,
            label: "D",
            shortHand: "D",
            type: "text",
          },
          col7: {
            active: false,
            label: "D",
            shortHand: "D",
            type: "text",
          },
          col8: {
            active: false,
            label: "D",
            shortHand: "D",
            type: "text",
          },
        },
        weapon2: {
          showHeader: true,
          label: "Ranged Weapons",
          icon: "ranged",
          col1: {
            active: true,
            label: "Range",
            shortHand: "Range",
            type: "text",
          },
          col2: {
            active: true,
            label: "Attacks",
            shortHand: "A",
            type: "text",
          },
          col3: {
            active: true,
            label: "BS",
            shortHand: "BS",
            type: "text",
          },
          col4: {
            active: true,
            label: "S",
            shortHand: "S",
            type: "text",
          },
          col5: {
            active: true,
            label: "AP",
            shortHand: "AP",
            type: "text",
          },
          col6: {
            active: true,
            label: "D",
            shortHand: "D",
            type: "text",
          },
          col7: {
            active: false,
            label: "D",
            shortHand: "D",
            type: "text",
          },
          col8: {
            active: false,
            label: "D",
            shortHand: "D",
            type: "text",
          },
        },
        weapon3: {
          showHeader: true,
          label: "Special Weapons",
          icon: "special",
          col1: {
            active: true,
            label: "Range",
            shortHand: "Range",
            type: "text",
          },
          col2: {
            active: true,
            label: "Attacks",
            shortHand: "A",
            type: "text",
          },
          col3: {
            active: true,
            label: "BS",
            shortHand: "BS",
            type: "text",
          },
          col4: {
            active: true,
            label: "S",
            shortHand: "S",
            type: "text",
          },
          col5: {
            active: true,
            label: "AP",
            shortHand: "AP",
            type: "text",
          },
          col6: {
            active: true,
            label: "D",
            shortHand: "D",
            type: "text",
          },
          col7: {
            active: false,
            label: "D",
            shortHand: "D",
            type: "text",
          },
          col8: {
            active: false,
            label: "D",
            shortHand: "D",
            type: "text",
          },
        },
      },
    },
    data: [
      {
        id: "fullcustom",
        link: "https://game-datacards.eu",
        name: "Custom Datacards",
        datasheets: [
          {
            name: "Custom Card",
            subName: "with a subname",
            role: "Basic",
            source: "fullcustom",
            id: "000000001",
            faction_id: "fullcustom",
            cardType: "DataCard",
            datasheet: {
              col1: "9",
              col2: "2+",
              col3: "2+",
              col4: "9",
              col5: "9",
              col6: "9",
              col7: "9",
              col8: "9",
              col9: "9",
              col10: "9",
            },
            abilities: {
              type1: [
                {
                  description: "",
                  name: "Core ability 1",
                },
              ],
              type2: [
                {
                  description: "",
                  name: "Faction ability 1",
                },
              ],
              type3: [
                {
                  description: "This is an discription of an extended ability. You can use markdown here.",
                  name: "Extended ability 1",
                },
              ],
            },
            weapon1: [
              {
                col1: "9",
                col2: "9",
                col3: "9",
                col4: "9",
                col5: "9",
                col6: "9",
                col7: "9",
                col8: "9",
              },
            ],
            weapon2: [
              {
                col1: "9",
                col2: "9",
                col3: "9",
                col4: "9",
                col5: "9",
                col6: "9",
                col7: "9",
                col8: "9",
              },
            ],
            weapon3: [
              {
                col1: "9",
                col2: "9",
                col3: "9",
                col4: "9",
                col5: "9",
                col6: "9",
                col7: "9",
                col8: "9",
              },
            ],
          },
        ],
      },
    ],
  };
};
