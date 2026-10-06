import React from "react";
import { TextSearch } from "lucide-react";

/**
 * StepKeywordParsing - Single step for v3.4.2 keyword parsing improvements
 *
 * @returns {JSX.Element} Keyword parsing improvement announcement step content
 */
export const StepKeywordParsing = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <TextSearch size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Improved Keyword Highlighting</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Keyword highlighting in ability text is now more accurate, and you can turn it off for individual words.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Turn Off Highlighting Per Word</strong>
          <p>
            Add <code>\</code> before any word in your ability text to keep it from being highlighted. For example,{" "}
            <code>\Blast</code> shows as plain &quot;Blast&quot; with no keyword styling applied.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Keywords Inside Other Words</strong>
          <p>
            Words like &quot;Blaster&quot;, &quot;Stealthsuit&quot;, and &quot;Freelance&quot; are no longer
            accidentally highlighted because they contain &quot;Blast&quot;, &quot;Stealth&quot;, or &quot;Lance&quot;.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Ability Names Left Alone</strong>
          <p>
            Keywords inside ability names like &quot;Tactical Precision:&quot; are no longer incorrectly highlighted.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepKeywordParsing;
