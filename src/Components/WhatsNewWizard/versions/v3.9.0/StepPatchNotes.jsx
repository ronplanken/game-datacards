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
      Write a keyword description once and every card that uses it shows the explanation automatically — just like the
      built-in 40K 10th Edition cards.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <BookOpen size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Glossary section in the editor
          </strong>
          <p>
            A new &quot;Keyword Glossary&quot; section under the datasource node. New 40K 10e datasources come
            pre-loaded with the 23 official weapon keywords (One Shot, Devastating Wounds, Anti-, Twin-linked, and
            friends). The section&apos;s ⋯ menu can restore the defaults at any time.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Tag size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Reusable across the whole card
          </strong>
          <p>
            Each entry says where it can be used — weapons, abilities, unit keywords, rules, stratagems, or
            enhancements. A single keyword like <em>Lethal Hits</em> can show up everywhere it&apos;s mentioned without
            duplicating the description.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <MousePointerClick size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Explanation row or hover tooltip
          </strong>
          <p>
            For weapon keywords, pick how the description shows: a line under the weapon table (the default, matching
            the built-in 40K layout) or a tooltip on the inline `[KEYWORD]` tag — perfect for keeping common rules off
            the card surface.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
