import React from "react";
import { Pencil, Swords, BarChart3, Tag, Sparkles, Smartphone } from "lucide-react";

export const StepMobileEditor = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Pencil size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Edit Cards on Mobile</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Tweak any card right from your phone. Open a card from your list, tap the pencil icon, and change anything you
      need. Your edits save automatically as you go.
    </p>

    <div className="wnw-sub-free-box">
      <div className="wnw-sub-free-header">
        <Smartphone size={20} className="wnw-sub-free-check" />
        <span>How it works</span>
      </div>
      <p className="wnw-sub-free-text">
        Add a card to your list, tap it to open, then tap the pencil icon in the top corner. That&apos;s it &mdash; no
        desktop needed.
      </p>
    </div>

    <div className="wnw-sub-tiers" style={{ gridTemplateColumns: "1fr" }}>
      <div className="wnw-sub-tier">
        <div className="wnw-sub-tier-header">
          <Pencil size={18} className="wnw-sub-tier-icon" />
          <span className="wnw-sub-tier-name">Everything is editable</span>
        </div>
        <ul className="wnw-sub-tier-features">
          <li>
            <BarChart3 size={14} />
            <span>Stat lines, invulnerable saves, and damaged profiles</span>
          </li>
          <li>
            <Swords size={14} />
            <span>Weapons and weapon profiles</span>
          </li>
          <li>
            <Sparkles size={14} />
            <span>Abilities, wargear options, and unit composition</span>
          </li>
          <li>
            <Tag size={14} />
            <span>Keywords, points, loadout, and leader info</span>
          </li>
        </ul>
      </div>
    </div>

    <p className="wnw-feature-description" style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
      Works with Warhammer 40K, Age of Sigmar, and your own custom datasources.
    </p>
  </div>
);

export default StepMobileEditor;
