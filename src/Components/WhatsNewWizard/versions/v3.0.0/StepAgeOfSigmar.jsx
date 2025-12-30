import React from "react";

/**
 * StepAgeOfSigmar - Age of Sigmar feature step for v3.0.0
 *
 * Highlights the new Age of Sigmar support including warscroll cards,
 * spell lores, manifestations, and faction styling.
 *
 * @returns {JSX.Element} Age of Sigmar feature step content
 */
export const StepAgeOfSigmar = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h2 className="wnw-feature-title">Age of Sigmar Support</h2>
    </div>
    <p className="wnw-feature-description">
      Full support for Age of Sigmar is here! Create and customize warscrolls for your armies with all the features you
      love.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Warscroll Cards</strong>
          <p>Complete warscroll support with all unit stats and abilities</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Spell Lores</strong>
          <p>Add and customize spell lores for your wizards</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Manifestations</strong>
          <p>Include manifestation cards in your collections</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Faction Styling</strong>
          <p>Unique visual styling for each Age of Sigmar faction</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepAgeOfSigmar;
