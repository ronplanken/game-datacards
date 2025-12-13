import { useState } from "react";
import { Check, Pencil, Trash2, Plus, X } from "lucide-react";
import { useMobileList } from "../useMobileList";
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

export const ListSelector = ({ isVisible, setIsVisible, onListSelected }) => {
  const { lists, selectedList, setSelectedList, createList, renameList, deleteList, getListPoints } = useMobileList();

  const handleClose = () => setIsVisible(false);

  const handleSelect = (index) => {
    setSelectedList(index);
    if (onListSelected) {
      onListSelected(index);
    }
    handleClose();
  };

  const handleDelete = (index) => {
    if (window.confirm(`Delete "${lists[index].name}"? This cannot be undone.`)) {
      deleteList(index);
    }
  };

  return (
    <BottomSheet isOpen={isVisible} onClose={handleClose} title="Your Lists" maxHeight="60vh">
      <div className="list-selector-content">
        <div className="list-selector-lists">
          {lists.map((list, index) => (
            <ListRow
              key={index}
              list={list}
              index={index}
              isSelected={index === selectedList}
              points={getListPoints(index)}
              onSelect={handleSelect}
              onRename={renameList}
              onDelete={handleDelete}
              canDelete={lists.length > 1}
            />
          ))}
        </div>
        <CreateListRow onCreate={createList} />
      </div>
    </BottomSheet>
  );
};
