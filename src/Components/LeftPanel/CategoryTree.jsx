import React from "react";
import clone from "just-clone";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { TreeCategory } from "../TreeCategory";
import { TreeItem } from "../TreeItem";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { getBackgroundColor, getMinHeight, move, reorder } from "../../Helpers/treeview.helpers";

export const CategoryTree = ({ selectedTreeIndex, setSelectedTreeIndex }) => {
  const { cardStorage, updateCategory } = useCardStorage();

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const sInd = source.droppableId;
    const dInd = destination.droppableId;

    if (sInd === dInd) {
      const sourceCat = clone(cardStorage.categories.find((cat) => cat.uuid === sInd));
      sourceCat.cards = reorder(sourceCat.cards, source.index, destination.index);
      updateCategory(sourceCat, sInd);
    } else {
      const sourceCat = clone(cardStorage.categories.find((cat) => cat.uuid === sInd));
      const destCat = clone(cardStorage.categories.find((cat) => cat.uuid === dInd));

      const newCategories = move(sourceCat.cards, destCat.cards, source, destination);
      sourceCat.cards = newCategories[sInd];
      destCat.cards = newCategories[dInd];
      destCat.closed = false;

      updateCategory(sourceCat, sInd);
      updateCategory(destCat, dInd);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        background: "white",
      }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {cardStorage.categories.map((category, categoryIndex) => (
          <div key={`category-${category.name}-${categoryIndex}`}>
            <Droppable key={`${category.uuid}-droppable`} droppableId={category.uuid}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minHeight: getMinHeight(snapshot),
                    backgroundColor: getBackgroundColor(snapshot),
                  }}>
                  <TreeCategory
                    category={category}
                    selectedTreeIndex={selectedTreeIndex}
                    setSelectedTreeIndex={setSelectedTreeIndex}>
                    {category.cards.map((card, cardIndex) => (
                      <TreeItem
                        card={card}
                        category={category}
                        selectedTreeIndex={selectedTreeIndex}
                        setSelectedTreeIndex={setSelectedTreeIndex}
                        index={cardIndex}
                        key={`${category.uuid}-item-${cardIndex}`}
                      />
                    ))}
                  </TreeCategory>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};
