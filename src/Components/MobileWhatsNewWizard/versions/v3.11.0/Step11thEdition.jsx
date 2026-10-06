import React from "react";
import { BookOpen, Crosshair, Languages, Sparkles, Swords } from "lucide-react";

export const Step11thEdition = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Crosshair size={28} />
      </div>
      <h2 className="mwnw-features-title">Warhammer 40,000: 11th Edition</h2>
      <p className="mwnw-features-subtitle">
        11th edition is now the default game system. 10th edition stays available as a legacy option.
      </p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Swords size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">All factions</span>
          <span className="mwnw-feature-item-desc">
            Datasheets, stratagems, enhancements, detachment rules and the core stratagems
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Languages size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Card text in 8 languages</span>
          <span className="mwnw-feature-item-desc">
            Set the card language in Settings. Untranslated fields fall back to English
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <BookOpen size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Keyword explanations</span>
          <span className="mwnw-feature-item-desc">
            Tap a weapon keyword or core ability to read the rule in the selected language
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Sparkles size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Premium</span>
          <span className="mwnw-feature-item-desc">
            A premium subscription adds cloud sync, the Card Designer and publishing your own datasources
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default Step11thEdition;
