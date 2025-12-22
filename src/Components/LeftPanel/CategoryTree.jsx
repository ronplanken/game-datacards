import React from "react";
import clone from "just-clone";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { TreeCategory, TreeItem } from "../TreeView";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { getBackgroundColor, getMinHeight, move, reorder } from "../../Helpers/treeview.helpers";

export const CategoryTree = ({ selectedTreeIndex, setSelectedTreeIndex }) => {
  const { cardStorage, updateCategory, getSubCategories } = useCardStorage();

  // Get only top-level categories (no parentId)
  const topLevelCategories = cardStorage.categories.filter((cat) => !cat.parentId);

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

  const renderSubCategories = (parentCategory) => {
    if (parentCategory.type === "list") return null;

    const subCategories = getSubCategories(parentCategory.uuid);
    if (subCategories.length === 0) return null;

    return subCategories.map((subCategory, subIndex) => (
      <Droppable key={`${subCategory.uuid}-droppable`} droppableId={subCategory.uuid}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: getMinHeight(snapshot),
              backgroundColor: getBackgroundColor(snapshot),
            }}>
            <TreeCategory
              category={subCategory}
              selectedTreeIndex={selectedTreeIndex}
              setSelectedTreeIndex={setSelectedTreeIndex}
              isSubCategory>
              {subCategory.cards.map((card, cardIndex) => (
                <TreeItem
                  card={card}
                  category={subCategory}
                  selectedTreeIndex={selectedTreeIndex}
                  setSelectedTreeIndex={setSelectedTreeIndex}
                  index={cardIndex}
                  key={`${subCategory.uuid}-item-${cardIndex}`}
                  isInSubCategory
                />
              ))}
            </TreeCategory>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ));
  };

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        background: "white",
      }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {topLevelCategories.map((category, categoryIndex) => (
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
            {/* Render sub-categories after the parent category's droppable */}
            {!category.closed && renderSubCategories(category)}
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};
