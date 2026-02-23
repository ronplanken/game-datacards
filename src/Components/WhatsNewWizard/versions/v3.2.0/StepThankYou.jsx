import React from "react";

/**
 * StepThankYou - Thank you / closing step for v3.2.0
 *
 * Final step encouraging users to create an account and linking to the Discord community.
 *
 * @returns {JSX.Element} Thank you step content
 */
export const StepThankYou = () => (
  <div className="wnw-thankyou-content">
    <h2 className="wnw-feature-title">You&apos;re All Set!</h2>
    <p className="wnw-feature-description">
      Sign in or create an account to start syncing your datacards across devices. All core features remain free.
    </p>
    <p className="wnw-feature-description">Have feedback or want to discuss features? Join our Discord community!</p>
    <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="wnw-discord-link">
      <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Join our Discord" />
    </a>
  </div>
);

export default StepThankYou;
