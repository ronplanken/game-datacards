import React from "react";

/**
 * StepThankYou - Final step for v3.1.1
 *
 * Thanks users and provides a link to the Discord community.
 *
 * @returns {JSX.Element} Thank you step content
 */
export const StepThankYou = () => (
  <div className="wnw-thankyou-content">
    <h2 className="wnw-feature-title">You&apos;re All Set!</h2>
    <p className="wnw-feature-description">
      Thank you for using Game Datacards. We hope these updates help you create even better cards for your games.
    </p>
    <p className="wnw-feature-description">Have feedback or want to discuss features? Join our Discord community!</p>
    <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="wnw-discord-link">
      <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Join our Discord" />
    </a>
  </div>
);

export default StepThankYou;
