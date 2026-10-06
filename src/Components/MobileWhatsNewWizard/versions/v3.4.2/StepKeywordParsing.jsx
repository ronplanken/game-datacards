import React from "react";
import { TextSearch, ShieldCheck, TextCursorInput } from "lucide-react";

/**
 * StepKeywordParsing - Single step for mobile v3.4.2 keyword parsing improvements
 *
 * @returns {JSX.Element} Keyword parsing improvement announcement step content
 */
export const StepKeywordParsing = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <TextSearch size={28} />
      </div>
      <h2 className="mwnw-features-title">Improved Keyword Highlighting</h2>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <TextCursorInput size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Turn Off Highlighting Per Word</span>
          <span className="mwnw-feature-item-desc">
            Add \ before any word in ability text to keep it from being highlighted as a keyword
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">More Accurate Detection</span>
          <span className="mwnw-feature-item-desc">
            Words like &quot;Blaster&quot; and &quot;Stealthsuit&quot; are no longer accidentally highlighted, and
            ability names like &quot;Tactical Precision:&quot; are left alone
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepKeywordParsing;
