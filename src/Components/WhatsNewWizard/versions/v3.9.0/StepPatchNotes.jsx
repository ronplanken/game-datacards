import React from "react";
import { BookOpen, MousePointerClick, Tag } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <BookOpen size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Keyword Glossary</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Write a keyword&apos;s explanation once and it appears on every card that uses it.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <BookOpen size={14} style={{ verticalAlign: -2, marginRight: 6 }} />A glossary section in the editor
          </strong>
          <p>New 40K 10th Edition datasources come pre-loaded with all 23 official weapon keywords.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Tag size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Reusable across the whole card
          </strong>
          <p>One keyword works across weapons, abilities, rules, stratagems, and more, with no copying.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <MousePointerClick size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Explanation row or hover tooltip
          </strong>
          <p>For weapon keywords, show the explanation as a row under the table or a hover tooltip.</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
