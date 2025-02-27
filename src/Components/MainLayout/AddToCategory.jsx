import { Button, Dropdown, Menu } from "antd";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { AddCard } from "../../Icons/AddCard";

export const AddToCategory = ({ activeCard, setSelectedTreeIndex }) => {
  const { cardStorage, addCardToCategory, setActiveCard: changeActiveCard, setActiveCategory } = useCardStorage();

  if (!activeCard || activeCard.isCustom) {
    return null;
  }

  const categoryMenu = (
    <Menu
      onClick={(e) => {
        const newCard = {
          ...activeCard,
          isCustom: true,
          uuid: uuidv4(),
        };
        const cat = { ...cardStorage.categories.find((c) => c.uuid === e.key) };
        addCardToCategory(newCard, cat.uuid);
        changeActiveCard(newCard);
        setActiveCategory(cat);
        setSelectedTreeIndex(`card-${newCard.uuid}`);
      }}
      items={cardStorage.categories
        .map((cat, index) => {
          if (index === 0) return null;
          return {
            key: cat.uuid,
            label: `Add to ${cat.name}`,
          };
        })
        .filter(Boolean)}
    />
  );

  if (cardStorage.categories?.length > 1) {
    return (
      <Dropdown.Button
        overlay={categoryMenu}
        icon={<AddCard />}
        type={"primary"}
        style={{ width: "auto" }}
        onClick={() => {
          const newCard = {
            ...activeCard,
            isCustom: true,
            uuid: uuidv4(),
          };
          const cat = { ...cardStorage.categories[0] };
          addCardToCategory(newCard);
          changeActiveCard(newCard);
          setActiveCategory(cat);
          setSelectedTreeIndex(`card-${newCard.uuid}`);
        }}>
        Add card to {cardStorage.categories[0].name}
      </Dropdown.Button>
    );
  }

  return (
    <Button
      type={"primary"}
      onClick={() => {
        const newCard = {
          ...activeCard,
          isCustom: true,
          uuid: uuidv4(),
        };
        const cat = { ...cardStorage.categories[0] };
        addCardToCategory(newCard);
        changeActiveCard(newCard);
        setActiveCategory(cat);
        setSelectedTreeIndex(`card-${newCard.uuid}`);
      }}>
      Add card to {cardStorage.categories[0].name}
    </Button>
  );
};
