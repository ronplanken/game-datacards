import React from "react";
import { Plus, Save, FolderPlus, ZoomIn } from "lucide-react";

/**
 * Step explaining how to add and save cards using the floating toolbar
 */
export const StepAddingCards = () => {
  return (
    <div className="wz-step-adding-cards">
      <h2 className="wz-step-title">Adding &amp; Saving Cards</h2>
      <p className="wz-step-description">
        Use the floating toolbar to add cards to your categories and save your changes.
      </p>

      <div className="wz-toolbar-preview">
        <div className="wz-toolbar-mock">
          <div className="wz-toolbar-btn wz-toolbar-btn--highlight">
            <Plus size={16} />
          </div>
          <div className="wz-toolbar-divider" />
          <div className="wz-toolbar-btn">
            <ZoomIn size={16} />
          </div>
          <div className="wz-toolbar-divider" />
          <div className="wz-toolbar-btn wz-toolbar-btn--save">
            <Save size={16} />
          </div>
        </div>
      </div>

      <div className="wz-toolbar-features">
        <div className="wz-toolbar-feature">
          <div className="wz-toolbar-feature-icon">
            <Plus size={20} />
          </div>
          <div className="wz-toolbar-feature-content">
            <h4 className="wz-toolbar-feature-title">Add to Category</h4>
            <p className="wz-toolbar-feature-desc">
              Browse units from the datasource and click the + button to add them to any of your categories.
            </p>
          </div>
        </div>

        <div className="wz-toolbar-feature">
          <div className="wz-toolbar-feature-icon">
            <Save size={20} />
          </div>
          <div className="wz-toolbar-feature-content">
            <h4 className="wz-toolbar-feature-title">Save Changes</h4>
            <p className="wz-toolbar-feature-desc">
              After editing a card, click Save to keep your changes. Changes are not saved automatically.
            </p>
          </div>
        </div>

        <div className="wz-toolbar-feature">
          <div className="wz-toolbar-feature-icon">
            <FolderPlus size={20} />
          </div>
          <div className="wz-toolbar-feature-content">
            <h4 className="wz-toolbar-feature-title">Create Categories</h4>
            <p className="wz-toolbar-feature-desc">
              Right-click in the category tree to create new categories for organizing your cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
