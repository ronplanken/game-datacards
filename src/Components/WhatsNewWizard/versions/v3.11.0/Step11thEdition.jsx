import React from "react";
import { Crosshair } from "lucide-react";

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
      11th edition is now fully supported and is the new default game system. All factions are included, with
      datasheets, stratagems, enhancements and detachment rules.
    </p>
    <p className="wnw-feature-description">
      Card text is available in 8 languages. You can pick your card language in Settings.
    </p>
    <p className="wnw-feature-description">
      Keywords now show their rules. Hover over a weapon keyword or core ability to read what it does, in your chosen
      language.
    </p>
  </div>
);

export default Step11thEdition;
