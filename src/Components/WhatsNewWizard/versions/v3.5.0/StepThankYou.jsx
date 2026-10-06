import React from "react";

/**
 * StepThankYou - Closing step for v3.5.0
 *
 * Directs users to the Datasources tab and links to the Discord community.
 *
 * @returns {JSX.Element} Thank you step content
 */
export const StepThankYou = () => (
  <div className="wnw-thankyou-content">
    <h2 className="wnw-feature-title">Ready to Build</h2>
    <p className="wnw-feature-description">
      Open the <strong>Datasources</strong> tab in the top navigation to start creating. This feature is in beta — your
      feedback helps shape what comes next.
    </p>
    <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="wnw-discord-link">
      <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Join our Discord" />
    </a>
  </div>
);

export default StepThankYou;
