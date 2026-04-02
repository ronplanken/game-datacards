import { EditorTextField } from "../shared/EditorTextField";

export const NameSection = ({ card, updateField }) => {
  return (
    <div className="mobile-editor-name-section">
      <EditorTextField
        value={card.name}
        onChange={(value) => updateField("name", value)}
        placeholder="Card name"
        className="mobile-editor-name-input"
      />
      {card.subname !== undefined && (
        <EditorTextField
          value={card.subname}
          onChange={(value) => updateField("subname", value)}
          placeholder="Subtitle"
          className="mobile-editor-subname-input"
        />
      )}
    </div>
  );
};
