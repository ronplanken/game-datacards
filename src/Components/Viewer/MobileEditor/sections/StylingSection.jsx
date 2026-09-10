import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorToggle } from "../shared/EditorToggle";

/**
 * Per-card styling toggles, mirroring the desktop editor's Styling panel.
 *
 * Only the options that make sense on a phone live here; the desktop panel's
 * image and colour pickers stay desktop-only.
 *
 * Wrap Keywords: long weapon keyword lists wrap inside the weapon name column
 * by default. Off keeps each list on one line, running on under the
 * characteristic columns. An absent flag means wrap.
 */
export const StylingSection = ({ card, label, icon, updateField }) => {
  return (
    <EditorAccordion title={label} icon={icon}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <EditorToggle
          label="Wrap Keywords"
          checked={card.wrapKeywords !== false}
          onChange={(value) => updateField("wrapKeywords", value)}
        />
      </div>
    </EditorAccordion>
  );
};
