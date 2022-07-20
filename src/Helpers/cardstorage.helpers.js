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

export const parseStorageJson = (savedJson) => {
  if (!savedJson) {
    return defaultCategories;
  }

  try {
    const parsedJson = JSON.parse(savedJson.replace(/(<([^>]+)>)/gi, ""));
    if (parsedJson.version !== process.env.REACT_APP_VERSION) {
      if (parsedJson.categories) {
        return parsedJson;
      }
      const newCards = parsedJson.map((card) => {
        return { ...card, uuid: uuidv4() };
      });
      return {
        ...defaultCategories,
        categories: [{ ...defaultCategories.categories[0], cards: newCards }],
      };
    } else {
      return parsedJson;
    }
  } catch (e) {
    return defaultCategories;
  }
};
