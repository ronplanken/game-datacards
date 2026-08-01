import React from "react";
import { Database, Image as ImageIcon, Pencil } from "lucide-react";

export const StepMakeItYours = () => (
  <div className="wnw-thankyou-content">
    <h2 className="wnw-feature-title">Make it your own</h2>
    <p className="wnw-feature-description">Everything you could already do with 10th edition cards works here too.</p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Pencil size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Edit any card
          </strong>
          <p>
            Stats, weapons, abilities, points and keywords, plus the stratagem, enhancement and rule cards. Edits apply
            to your selected card language and leave the other languages untouched.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Database size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            11th Edition datasources
          </strong>
          <p>
            The Datasource Editor has 11th edition as a base system. New datasources start with the full 11e keyword
            glossary already loaded.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <ImageIcon size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Bulk image export
          </strong>
          <p>Pick the edition in the Image Generator, choose your factions, and export their cards as images.</p>
        </div>
      </div>
    </div>

    <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="wnw-discord-link">
      <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Join our Discord" />
    </a>
  </div>
);

export default StepMakeItYours;
