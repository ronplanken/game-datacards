import React from "react";
import { BookOpen, Crosshair, Languages, Swords } from "lucide-react";

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
      11th edition is here, and it is the new default game system. 10th edition stays available as a legacy option.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Swords size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Every faction, fully carded
          </strong>
          <p>
            Datasheets, stratagems, enhancements and detachment rules, plus the core stratagems like Command Re-roll and
            Fire Overwatch under every faction&apos;s Basic stratagems.
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
          <p>Pick your card language in Settings. Anything not translated yet falls back to English, field by field.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <BookOpen size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Keywords that explain themselves
          </strong>
          <p>
            Weapon keywords and core abilities get a dotted underline. Hover one to read what it does, in your chosen
            language.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Step11thEdition;
