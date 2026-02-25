import React from "react";

/**
 * StepThankYou - Thank you / closing step for v3.1.0
 *
 * Final step that thanks users and provides a link to the Discord community.
 *
 * @returns {JSX.Element} Thank you step content
 */
export const StepThankYou = () => (
  <div className="wnw-thankyou-content">
    <h2 className="wnw-feature-title">You&apos;re All Set!</h2>
    <p className="wnw-feature-description">
      Thanks for updating to version 3.1. Try out custom datasources and the new quick add workflow.
    </p>
    <p className="wnw-feature-description">Have feedback or ideas? Join our Discord community!</p>
    <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="wnw-discord-link">
      <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Join our Discord" />
    </a>
  </div>
);

export default StepThankYou;
