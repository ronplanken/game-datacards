import React from "react";
import clone from "just-clone";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { TreeCategory, TreeItem, TreeDatasource } from "../TreeView";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { getBackgroundColor, getMinHeight, move, reorder } from "../../Helpers/treeview.helpers";

export const CategoryTree = ({ selectedTreeIndex, setSelectedTreeIndex }) => {
  const {
    cardStorage,
    updateCategory,
    getSubCategories,
    getLocalDatasources,
    reorderCategories,
    reorderDatasources,
    reorderChildCategories,
  } = useCardStorage();

  // Get local datasources (type === "local-datasource")
  const localDatasources = getLocalDatasources();

  // Get only top-level categories (no parentId and not local-datasource)
  const topLevelCategories = cardStorage.categories.filter((cat) => !cat.parentId && cat.type !== "local-datasource");

  const handleDragEnd = (result) => {
    const { source, destination, type } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    // Category-level reorder
    if (type === "CATEGORY") {
      if (source.index !== destination.index) {
        reorderCategories(source.index, destination.index);
      }
      return;
    }

    // Datasource-level reorder
    if (type === "DATASOURCE") {
      if (source.index !== destination.index) {
        reorderDatasources(source.index, destination.index);
      }
      return;
    }

    // Sub-category reorder
    if (type === "SUBCATEGORY") {
      if (source.index !== destination.index) {
        const parentUuid = source.droppableId.replace("subcats-", "");
        reorderChildCategories(parentUuid, source.index, destination.index);
      }
      return;
    }

    // Card-level reorder/move (existing behavior)
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

    return (
      <Droppable droppableId={`subcats-${parentCategory.uuid}`} type="SUBCATEGORY">
        {(subListProvided) => (
          <div ref={subListProvided.innerRef} {...subListProvided.droppableProps}>
            {subCategories.map((subCategory, subIndex) => (
              <Draggable
                key={`subcat-drag-${subCategory.uuid}`}
                draggableId={`subcat-drag-${subCategory.uuid}`}
                index={subIndex}>
                {(subDragProvided, subDragSnapshot) => (
                  <div
                    ref={subDragProvided.innerRef}
                    {...subDragProvided.draggableProps}
                    className={subDragSnapshot.isDragging ? "category-dragging" : ""}>
                    <Droppable droppableId={subCategory.uuid} type="CARD">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            minHeight: getMinHeight(snapshot),
                            backgroundColor: subDragSnapshot.isDragging ? "transparent" : getBackgroundColor(snapshot),
                          }}>
                          <TreeCategory
                            category={subCategory}
                            selectedTreeIndex={selectedTreeIndex}
                            setSelectedTreeIndex={setSelectedTreeIndex}
                            isSubCategory
                            dragHandleProps={subDragProvided.dragHandleProps}>
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
                  </div>
                )}
              </Draggable>
            ))}
            {subListProvided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        background: "white",
      }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Render local datasources in a droppable for reordering */}
        <Droppable droppableId="datasource-list" type="DATASOURCE">
          {(dsListProvided) => (
            <div ref={dsListProvided.innerRef} {...dsListProvided.droppableProps}>
              {localDatasources.map((datasource, dsIndex) => (
                <Draggable
                  key={`ds-drag-${datasource.uuid}`}
                  draggableId={`ds-drag-${datasource.uuid}`}
                  index={dsIndex}>
                  {(dsDragProvided, dsDragSnapshot) => (
                    <div
                      ref={dsDragProvided.innerRef}
                      {...dsDragProvided.draggableProps}
                      className={dsDragSnapshot.isDragging ? "category-dragging" : ""}>
                      <Droppable droppableId={datasource.uuid} type="CARD">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              minHeight: getMinHeight(snapshot),
                              backgroundColor: dsDragSnapshot.isDragging ? "transparent" : getBackgroundColor(snapshot),
                            }}>
                            <TreeDatasource
                              datasource={datasource}
                              selectedTreeIndex={selectedTreeIndex}
                              setSelectedTreeIndex={setSelectedTreeIndex}
                              dragHandleProps={dsDragProvided.dragHandleProps}>
                              {datasource.cards?.map((card, cardIndex) => (
                                <TreeItem
                                  card={card}
                                  category={datasource}
                                  selectedTreeIndex={selectedTreeIndex}
                                  setSelectedTreeIndex={setSelectedTreeIndex}
                                  index={cardIndex}
                                  key={`${datasource.uuid}-item-${cardIndex}`}
                                  isInDatasource
                                />
                              ))}
                            </TreeDatasource>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {dsListProvided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Render regular categories in a droppable for reordering */}
        <Droppable droppableId="category-list" type="CATEGORY">
          {(catListProvided) => (
            <div ref={catListProvided.innerRef} {...catListProvided.droppableProps}>
              {topLevelCategories.map((category, categoryIndex) => (
                <Draggable
                  key={`cat-drag-${category.uuid}`}
                  draggableId={`cat-drag-${category.uuid}`}
                  index={categoryIndex}>
                  {(catDragProvided, catDragSnapshot) => (
                    <div
                      ref={catDragProvided.innerRef}
                      {...catDragProvided.draggableProps}
                      className={catDragSnapshot.isDragging ? "category-dragging" : ""}>
                      <Droppable droppableId={category.uuid} type="CARD">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              minHeight: getMinHeight(snapshot),
                              backgroundColor: catDragSnapshot.isDragging
                                ? "transparent"
                                : getBackgroundColor(snapshot),
                            }}>
                            <TreeCategory
                              category={category}
                              selectedTreeIndex={selectedTreeIndex}
                              setSelectedTreeIndex={setSelectedTreeIndex}
                              dragHandleProps={catDragProvided.dragHandleProps}>
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
                      {/* Render sub-categories inside the parent Draggable so they move together */}
                      {!category.closed && renderSubCategories(category)}
                    </div>
                  )}
                </Draggable>
              ))}
              {catListProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
