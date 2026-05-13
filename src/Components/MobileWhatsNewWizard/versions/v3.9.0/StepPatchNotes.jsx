import React from "react";
import { BookOpen, MousePointerClick, Tag } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <BookOpen size={28} />
      </div>
      <h2 className="mwnw-features-title">Keyword Glossary</h2>
      <p className="mwnw-features-subtitle">
        Write a keyword description once and every card that uses it shows the explanation automatically.
      </p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <BookOpen size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Glossary section in the editor</span>
          <span className="mwnw-feature-item-desc">
            A new section under the datasource node. New 40K 10e datasources come pre-loaded with the 23 official weapon
            keywords.
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Tag size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Reusable across the whole card</span>
          <span className="mwnw-feature-item-desc">
            Each entry says where it can be used — weapons, abilities, unit keywords, rules, stratagems, or enhancements
            — so one description covers every spot the keyword appears.
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <MousePointerClick size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Explanation row or hover tooltip</span>
          <span className="mwnw-feature-item-desc">
            For weapon keywords, pick how the description shows: a line under the weapon table or a tooltip on the
            inline tag.
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
