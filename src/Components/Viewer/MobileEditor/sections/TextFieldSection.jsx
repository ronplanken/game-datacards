import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";

/**
 * Simple section wrapping a single text/markdown field (loadout, transport).
 */
export const TextFieldSection = ({ card, config, label, icon, updateField }) => {
  const { dataPath } = config;

  return (
    <EditorAccordion title={label} icon={icon}>
      <EditorTextField
        value={card[dataPath]}
        onChange={(value) => updateField(dataPath, value)}
        placeholder={label}
        multiline
      />
    </EditorAccordion>
  );
};
