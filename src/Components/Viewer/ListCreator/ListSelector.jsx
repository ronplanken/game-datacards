import { useState } from "react";
import { Check, Pencil, Trash2, Plus, X, Cloud, Loader2 } from "lucide-react";
import { useMobileList } from "../useMobileList";
import { useCloudCategories } from "../../../Hooks/useCloudCategories";
import { useAuth } from "../../../Hooks/useAuth";
import { BottomSheet } from "../Mobile/BottomSheet";
import "./ListSelector.css";

// Inline edit input component
const EditInput = ({ value, onSave, onCancel }) => {
  const [inputValue, setInputValue] = useState(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSave(inputValue.trim());
    }
  };

  return (
    <form className="list-selector-edit-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="list-selector-edit-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        autoFocus
        onBlur={() => {
          if (inputValue.trim()) {
            onSave(inputValue.trim());
          } else {
            onCancel();
          }
        }}
      />
    </form>
  );
};

// Single list row component
const ListRow = ({ list, index, isSelected, points, onSelect, onRename, onDelete, canDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newName) => {
    onRename(index, newName);
    setIsEditing(false);
  };

  return (
    <div className={`list-selector-row ${isSelected ? "selected" : ""}`}>
      <button className="list-selector-row-main" onClick={() => onSelect(index)} type="button">
        <div className="list-selector-row-check">{isSelected && <Check size={16} />}</div>
        {isEditing ? (
          <EditInput value={list.name} onSave={handleSave} onCancel={() => setIsEditing(false)} />
        ) : (
          <span className="list-selector-row-name">{list.name}</span>
        )}
        <span className="list-selector-row-points">{points} pts</span>
      </button>
      <div className="list-selector-row-actions">
        <button
          className="list-selector-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          type="button">
          <Pencil size={16} />
        </button>
        {canDelete && (
          <button
            className="list-selector-action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            type="button">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Create new list row
const CreateListRow = ({ onCreate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreate(newName.trim());
      setNewName("");
      setIsCreating(false);
    }
  };

  if (isCreating) {
    return (
      <div className="list-selector-create creating">
        <form onSubmit={handleSubmit} className="list-selector-create-form">
          <input
            type="text"
            className="list-selector-create-input"
            placeholder="List name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="list-selector-create-save" disabled={!newName.trim()}>
            <Check size={18} />
          </button>
          <button
            type="button"
            className="list-selector-create-cancel"
            onClick={() => {
              setIsCreating(false);
              setNewName("");
            }}>
            <X size={18} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <button className="list-selector-create" onClick={() => setIsCreating(true)} type="button">
      <Plus size={18} />
      <span>Create New List</span>
    </button>
  );
};

// Game system badge component
const GameSystemBadge = ({ system }) => {
  const labels = {
    "40k": "40K",
    aos: "AoS",
    necro: "Necro",
    custom: "Custom",
  };

  return <span className={`cloud-category-badge cloud-category-badge--${system}`}>{labels[system] || "Custom"}</span>;
};

// Cloud category row component (now selectable like local lists)
const CloudCategoryRow = ({ category, isSelected, onSelect }) => (
  <div className={`list-selector-row list-selector-row--cloud ${isSelected ? "selected" : ""}`}>
    <button className="list-selector-row-main" onClick={() => onSelect(category)} type="button">
      <div className="list-selector-row-check">{isSelected && <Check size={16} />}</div>
      <div className="list-selector-row-cloud-icon">
        <Cloud size={14} />
      </div>
      <div className="list-selector-row-cloud-info">
        <span className="list-selector-row-name">{category.name}</span>
        <div className="list-selector-row-cloud-meta">
          <GameSystemBadge system={category.gameSystem} />
          <span className="list-selector-row-cloud-count">
            {category.cardCount} card{category.cardCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </button>
  </div>
);

export const ListSelector = ({ isVisible, setIsVisible, onListSelected }) => {
  const {
    lists,
    selectedList,
    setSelectedList,
    createList,
    renameList,
    deleteList,
    getListPoints,
    selectedCloudCategoryId,
    selectCloudCategory,
  } = useMobileList();
  const { user } = useAuth();
  const { categories: cloudCategories, isLoading: categoriesLoading } = useCloudCategories();

  const handleClose = () => setIsVisible(false);

  // Select a local list
  const handleSelect = (index) => {
    setSelectedList(index);
    if (onListSelected) {
      onListSelected(index);
    }
    handleClose();
  };

  // Select a cloud category (pass UUID for realtime updates)
  const handleCloudCategorySelect = (category) => {
    selectCloudCategory(category.uuid);
    handleClose();
  };

  const handleDelete = (index) => {
    if (window.confirm(`Delete "${lists[index].name}"? This cannot be undone.`)) {
      deleteList(index);
    }
  };

  // Check if a cloud category is currently selected
  const isCloudCategorySelected = (category) => {
    return selectedCloudCategoryId === category.uuid;
  };

  // Check if a local list is selected (only when no cloud category is selected)
  const isLocalListSelected = (index) => {
    return !selectedCloudCategoryId && index === selectedList;
  };

  return (
    <BottomSheet isOpen={isVisible} onClose={handleClose} title="Your Lists" maxHeight="70vh">
      <div className="list-selector-content">
        {/* Local Lists Section */}
        <div className="list-selector-lists">
          {lists.map((list, index) => (
            <ListRow
              key={index}
              list={list}
              index={index}
              isSelected={isLocalListSelected(index)}
              points={getListPoints(index)}
              onSelect={handleSelect}
              onRename={renameList}
              onDelete={handleDelete}
              canDelete={lists.length > 1}
            />
          ))}
        </div>
        <CreateListRow onCreate={createList} />

        {/* Cloud Categories Section */}
        {user && (
          <div className="cloud-categories-section">
            <div className="cloud-categories-divider">
              <span>Cloud Categories</span>
            </div>

            {categoriesLoading ? (
              <div className="cloud-categories-loading">
                <Loader2 size={18} className="spinning" />
                <span>Loading...</span>
              </div>
            ) : cloudCategories.length === 0 ? (
              <div className="cloud-categories-empty">
                <p>No cloud categories yet</p>
                <p className="cloud-categories-hint">Sync categories from the desktop app</p>
              </div>
            ) : (
              <div className="list-selector-lists">
                {cloudCategories.map((category) => (
                  <CloudCategoryRow
                    key={category.uuid}
                    category={category}
                    isSelected={isCloudCategorySelected(category)}
                    onSelect={handleCloudCategorySelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sign in prompt for guests */}
        {!user && (
          <div className="cloud-categories-section">
            <div className="cloud-categories-divider">
              <span>Cloud Categories</span>
            </div>
            <div className="cloud-categories-empty">
              <p>Sign in to see your cloud categories</p>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
