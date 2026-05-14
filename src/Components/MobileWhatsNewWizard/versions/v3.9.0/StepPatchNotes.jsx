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
        Write a keyword&apos;s explanation once and it appears on every card that uses it.
      </p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <BookOpen size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">A glossary section in the editor</span>
          <span className="mwnw-feature-item-desc">
            New 40K 10th Edition datasources come pre-loaded with all 23 official weapon keywords.
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
            One keyword works across weapons, abilities, rules, stratagems, and more, with no copying.
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
            For weapon keywords, show the explanation as a row under the table or a hover tooltip.
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
