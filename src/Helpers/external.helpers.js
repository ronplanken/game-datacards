import clone from "just-clone";

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

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

  dataFactions.sort((a, b) => a.name.localeCompare(b.name));

  const mappedStratagems = dataStratagems.map((stratagem) => {
    stratagem["cardType"] = "stratagem";
    return stratagem;
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

    const linkedDamageTable = dataDamage.filter(
      (damage) => damage.datasheet_id === row.id
    );
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
      row["datasheet"].push(newRow);
    }

    const linkedWargear = [
      ...new Map(
        dataDatasheetWargear
          .filter(
            (wargear) =>
              wargear.datasheet_id === row.id &&
              wargear.is_index_wargear === "false"
          )
          .map((item) => [item["wargear_id"], item])
      ).values(),
    ];

    row["wargear"] = [];
    linkedWargear.forEach((wargear, index) => {
      row["wargear"][index] = clone(
        dataWargear.find((gear) => gear.id === wargear.wargear_id)
      );
      if (row["wargear"][index]) {
        row["wargear"][index]["active"] = index === 0 ? true : false;
        row["wargear"][index]["profiles"] = clone(
          dataWargearList.filter(
            (wargearList) => wargearList.wargear_id === wargear.wargear_id
          )
        );
      }
    });
    const linkedAbilities = dataDatasheetAbilities.filter(
      (ability) => ability.datasheet_id === row.id
    );
    row["abilities"] = [];
    linkedAbilities.forEach((ability, index) => {
      row["abilities"].push(
        dataAbilities.find(
          (abilityInfo) => abilityInfo.id === ability.ability_id
        )
      );
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
  dataFactions.map((faction) => {
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
    return faction;
  });

  return {
    data: dataFactions,
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
            unit_composition:
              "Basic unit description you can customize to your needs. Empty this field to hide it",
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
            cp_cost: "1",
            description:
              "This is an example description. You can even use _markdown_ in this text!",
            faction_id: "basic",
            id: "000006084006",
            name: "THE BASIC STRAT",
            type: "Just another stratagem",
          },
        ],
      },
    ],
  };
};
