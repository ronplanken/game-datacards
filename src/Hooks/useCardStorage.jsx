import { message } from "antd";
import clone from "just-clone";
import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { parseStorageJson } from "../Helpers/cardstorage.helpers";

const CardStorageContext = React.createContext(undefined);

export function useCardStorage() {
  const context = React.useContext(CardStorageContext);
  if (context === undefined) {
    throw new Error("`useCardStorage` must be used with an `CardStorageProvider`");
  }
  return context;
}

export const CardStorageProviderComponent = (props) => {
  const [cardStorage, setCardStorage] = React.useState(() => {
    try {
      const oldStorage = localStorage.getItem("cards");
      const newStorage = localStorage.getItem("storage");
      if (oldStorage && !newStorage) {
        return parseStorageJson(oldStorage);
      }
      return parseStorageJson(newStorage);
    } catch (e) {
      message.error("An error occored while trying to load your cards.");
      return [];
    }
  });

  const [activeCard, setActiveCard] = React.useState(null);
  const [cardUpdated, setCardUpdated] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState(null);

  useEffect(() => {
    const version = process.env.REACT_APP_VERSION;
    localStorage.setItem("storage", JSON.stringify({ ...cardStorage, version }));
  }, [cardStorage]);

  const updateActiveCard = (card) => {
    if (!card) {
      return;
    }
    const copiedCard = clone(card);
    setCardUpdated(true);
    setActiveCard(copiedCard);
  };

  const changeActiveCard = (card) => {
    setCardUpdated(false);
    setActiveCard(card);
  };

  const saveActiveCard = () => {
    if (!activeCard) {
      return;
    }
    setCardUpdated(false);
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const categoryIndex = newStorage.categories.findIndex((cat) => cat.uuid === activeCategory.uuid);
      const newCards = newStorage.categories[categoryIndex].cards;
      newCards[newCards.findIndex((card) => card.uuid === activeCard.uuid)] = activeCard;
      newStorage.categories[categoryIndex].cards = newCards;
      return newStorage;
    });
  };

  const addCardToCategory = (card, categoryId) => {
    if (!card) {
      return;
    }
    const copiedCard = clone(card);
    if (!categoryId) {
      setCardStorage((prevStorage) => {
        const newStorage = clone(prevStorage);
        newStorage.categories[0].cards.push(copiedCard);
        newStorage.categories[0].closed = false;
        return {
          ...newStorage,
        };
      });
    } else {
      setCardStorage((prevStorage) => {
        const newStorage = clone(prevStorage);
        newStorage.categories.find((cat) => cat.uuid === categoryId).cards.push(copiedCard);
        newStorage.categories.find((cat) => cat.uuid === categoryId).closed = false;
        return {
          ...newStorage,
        };
      });
    }
  };

  const importCategory = (category) => {
    if (!category) {
      return;
    }
    if (!category.cards) {
      return;
    }
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      newStorage.categories.push(category);
      return {
        ...newStorage,
      };
    });
  };
  const addCategory = (categoryName) => {
    if (!categoryName) {
      return;
    }
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      newStorage.categories.push({
        uuid: uuidv4(),
        name: categoryName,
        cards: [],
      });
      return {
        ...newStorage,
      };
    });
  };

  const renameCategory = (categoryId, newCategoryName) => {
    if (!categoryId || !newCategoryName) {
      return;
    }
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const index = newStorage.categories.findIndex((cat) => cat.uuid === categoryId);
      newStorage.categories[index] = {
        ...newStorage.categories[index],
        name: newCategoryName,
      };
      return {
        ...newStorage,
      };
    });
  };

  const removeCardFromCategory = (cardId, categoryId) => {
    if (!cardId) {
      return;
    }
    if (!categoryId) {
      setCardStorage((prevStorage) => {
        const newStorage = clone(prevStorage);
        const newCards = newStorage.categories[0].cards.filter((card) => card.uuid !== cardId);
        newStorage.categories[0].cards = newCards;
        return {
          ...newStorage,
          categories: [...newStorage.categories],
        };
      });
    } else {
      setCardStorage((prevStorage) => {
        const newStorage = clone(prevStorage);
        const catIndex = newStorage.categories.findIndex((cat) => cat.uuid === categoryId);
        const newCards = newStorage.categories[catIndex].cards.filter((card) => card.uuid !== cardId);
        newStorage.categories[catIndex].cards = newCards;
        return newStorage;
      });
    }
  };
  const removeCategory = (categoryId) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const newCategories = newStorage.categories.filter((cat) => cat.uuid !== categoryId);
      return {
        ...newStorage,
        categories: [...newCategories],
      };
    });
  };

  const updateCategory = (category, uuid) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const newCategories = newStorage.categories;
      newCategories[newStorage.categories.findIndex((cat) => cat.uuid === uuid)] = category;
      return {
        ...newStorage,
        categories: [...newCategories],
      };
    });
  };

  const context = {
    cardStorage,
    activeCard,
    updateActiveCard,
    setActiveCard: changeActiveCard,
    activeCategory,
    cardUpdated,
    saveActiveCard,
    setActiveCategory,
    addCardToCategory,
    removeCardFromCategory,
    importCategory,
    renameCategory,
    removeCategory,
    addCategory,
    updateCategory,
  };

  return <CardStorageContext.Provider value={context}>{props.children}</CardStorageContext.Provider>;
};
