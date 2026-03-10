import React from "react";
import { LayoutTemplate, Palette, Printer } from "lucide-react";

/**
 * StepAoSTemplates - Single step for v3.4.1 AoS Custom Templates
 *
 * @returns {JSX.Element} AoS template support announcement step content
 */
export const StepAoSTemplates = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <LayoutTemplate size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">AoS Custom Templates</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Custom templates now work with Age of Sigmar cards. Design your own warscroll and spell card layouts in the Card
      Designer, then apply them to any AoS card.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Warscrolls and Spells</strong>
          <p>
            Select a custom template from the warscroll or spell editor. Your card data fills in automatically using the
            same data bindings as the designer.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Full Rendering Support</strong>
          <p>
            Custom templates render everywhere: the editor preview, print output, and the mobile viewer. Switch back to
            the built-in layout at any time by clearing the template.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Account Required</strong>
          <p>
            Template support requires a user account with Card Designer access. Create AoS-targeted templates in the
            designer, then assign them in the card editor.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepAoSTemplates;
