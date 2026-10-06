import React from "react";
import { Pencil, Swords, BarChart3, Tag, Sparkles } from "lucide-react";

export const StepMobileEditor = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Pencil size={28} />
      </div>
      <h2 className="mwnw-features-title">Edit Cards on Mobile</h2>
      <p className="mwnw-features-subtitle">
        Open any card from your list, tap the pencil icon, and change anything you need. Edits save automatically.
      </p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <BarChart3 size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Stats and Profiles</span>
          <span className="mwnw-feature-item-desc">
            Change stat lines, invulnerable saves, damaged profiles, and units with multiple profiles
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Swords size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Weapons</span>
          <span className="mwnw-feature-item-desc">
            Add, remove, and edit weapon profiles with all their characteristics
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Sparkles size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Abilities and Wargear</span>
          <span className="mwnw-feature-item-desc">
            Edit abilities, wargear options, unit composition, loadout, and leader info
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Tag size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Keywords and Points</span>
          <span className="mwnw-feature-item-desc">
            Add or remove keywords, adjust points, and works with your custom datasources too
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepMobileEditor;
