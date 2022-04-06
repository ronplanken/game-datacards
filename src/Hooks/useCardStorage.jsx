import React, { useEffect } from 'react';
import { message } from 'antd';
import { parseStorageJson } from '../Helpers/cardstorage.helpers';
import clone from 'just-clone';

const CardStorageContext = React.createContext(undefined);

export function useCardStorage() {
  const context = React.useContext(CardStorageContext);
  if (context === undefined) {
    throw new Error('`useCardStorage` must be used with an `CardStorageProvider`');
  }
  return context;
}

export const CardStorageProviderComponent = (props) => {
  const [cardStorage, setCardStorage] = React.useState(() => {
    try {
      return parseStorageJson(localStorage.getItem('storage'));
    } catch (e) {
      message.error('An error occored while trying to load your cards.');
      return [];
    }
  });

  const [activeCard, setActiveCard] = React.useState(null);
  const [cardUpdated, setCardUpdated] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState(null);

  useEffect(() => {
    localStorage.setItem('storage', JSON.stringify(cardStorage));
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
    console.log(activeCard);
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
        prevStorage.categories[0].cards.push(copiedCard);
        return {
          ...prevStorage,
        };
      });
    } else {
      setCardStorage((prevStorage) => {
        prevStorage.categories.find((cat) => cat.uuid === categoryId).push(copiedCard);
        return {
          ...prevStorage,
        };
      });
    }
  };

  const removeCardFromCategory = (cardId, categoryId) => {
    if (!cardId) {
      return;
    }
    if (!categoryId) {
      setCardStorage((prevStorage) => {
        const newCards = prevStorage.categories[0].cards.filter((card) => card.uuid !== cardId);
        prevStorage.categories[0].cards = newCards;
        return {
          ...prevStorage,
          categories: [...prevStorage.categories],
        };
      });
    } else {
      setCardStorage((prevStorage) => {
        const category = prevStorage.categories.find((cat) => cat.uuid === categoryId);
        const newCards = category.cards.filter((card) => card.uuid !== cardId);
        category.cards = newCards;
        return {
          ...prevStorage,
          categories: [...prevStorage.categories, category],
        };
      });
    }
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
  };

  return <CardStorageContext.Provider value={context}>{props.children}</CardStorageContext.Provider>;
};
