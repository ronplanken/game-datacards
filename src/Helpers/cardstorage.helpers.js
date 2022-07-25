import compareVersions from "compare-versions";
import { v4 as uuidv4 } from "uuid";

const defaultCategories = {
  version: process.env.REACT_APP_VERSION,
  categories: [
    {
      uuid: uuidv4(),
      name: "My Cards",
      cards: [],
    },
  ],
};

const upgradeStoredCards = (parsedJson) => {
  //If older then version 1.2.x
  if (compareVersions(parsedJson.version, "1.2.x") === -1) {
    if (parsedJson.categories) {
      return parsedJson;
    }
    const newCards = parsedJson.map((card) => {
      return { ...card, uuid: uuidv4(), source: "40k" };
    });
    return {
      ...defaultCategories,
      categories: [{ ...defaultCategories.categories[0], cards: newCards }],
    };
  }
  //Check if cards were saved with the previous version and add the source option.
  if (compareVersions(parsedJson.version, "1.2.x") === 0) {
    return {
      ...parsedJson,
      categories: parsedJson.categories.map((cat) => {
        return {
          ...cat,
          cards: cat.cards.map((card) => {
            return { ...card, source: "40k" };
          }),
        };
      }),
    };
  }
}
export const parseStorageJson = (savedJson) => {
  if (!savedJson) {
    return defaultCategories;
  }

  try {
    const parsedJson = JSON.parse(savedJson.replace(/(<([^>]+)>)/gi, ""));

    if (compareVersions(parsedJson.version, process.env.REACT_APP_VERSION) === 0) {
      return parsedJson;
    }
    if (compareVersions(parsedJson.version, process.env.REACT_APP_VERSION) === -1) {
      return upgradeStoredCards(parsedJson);
    }
    if (compareVersions(parsedJson.version, process.env.REACT_APP_VERSION) === 1) {
      return parsedJson;
    }
  } catch (e) {
    return defaultCategories;
  }
};
