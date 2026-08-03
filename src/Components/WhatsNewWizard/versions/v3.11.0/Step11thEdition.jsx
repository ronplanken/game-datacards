import React from "react";
import { BookOpen, Crosshair, Languages, Sparkles, Swords } from "lucide-react";

export const Step11thEdition = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Crosshair size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Warhammer 40,000: 11th Edition</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      11th edition is now the default game system. 10th edition stays available as a legacy option.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Swords size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            All factions
          </strong>
          <p>
            Datasheets, stratagems, enhancements and detachment rules for every faction. The core stratagems, such as
            Command Re-roll and Fire Overwatch, are listed under the Basic stratagems of each faction.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Languages size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Card text in 8 languages
          </strong>
          <p>Set the card language in Settings. Fields that are not translated yet fall back to English.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <BookOpen size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Keyword explanations
          </strong>
          <p>
            Weapon keywords and core abilities have a dotted underline. Hover over one to read the rule in the selected
            language.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Sparkles size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Premium
          </strong>
          <p>A premium subscription adds cloud sync, the Card Designer and publishing your own datasources.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Step11thEdition;
