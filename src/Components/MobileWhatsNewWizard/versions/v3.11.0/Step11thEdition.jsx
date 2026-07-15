import React from "react";
import { Crosshair, Swords, Languages, BookOpen } from "lucide-react";

export const Step11thEdition = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Crosshair size={28} />
      </div>
      <h2 className="mwnw-features-title">Warhammer 40,000: 11th Edition</h2>
      <p className="mwnw-features-subtitle">11th edition is now fully supported and is the new default game system.</p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Swords size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">All factions</span>
          <span className="mwnw-feature-item-desc">
            Datasheets, stratagems, enhancements and detachment rules for every faction
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Languages size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Card languages</span>
          <span className="mwnw-feature-item-desc">Card text in 8 languages. Pick yours in Settings</span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <BookOpen size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Keyword rules</span>
          <span className="mwnw-feature-item-desc">
            Tap a weapon keyword or core ability to read what it does, in your chosen language
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default Step11thEdition;
