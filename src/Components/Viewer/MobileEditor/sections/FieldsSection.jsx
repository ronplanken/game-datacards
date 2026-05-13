import { EditorAccordion } from "../shared/EditorAccordion";
import { SchemaFieldEditor } from "../shared/SchemaFieldEditor";

export const FieldsSection = ({ card, config, label, icon, updateField }) => {
  const { fields } = config;

  return (
    <EditorAccordion title={label} icon={icon}>
      <div className="mobile-editor-fields-list">
        {fields.map((field) => (
          <SchemaFieldEditor
            key={field.key}
            field={field}
            value={card[field.key]}
            onChange={(value) => updateField(field.key, value)}
          />
        ))}
      </div>
    </EditorAccordion>
  );
};
