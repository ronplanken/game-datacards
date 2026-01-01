import React from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * StepThankYou - Thank you / closing step for mobile v3.1.0
 *
 * Final step with Discord community link.
 *
 * @returns {JSX.Element} Thank you step content
 */
export const StepThankYou = () => (
  <div className="mwnw-thankyou">
    <div className="mwnw-thankyou-icon">
      <CheckCircle2 size={40} />
    </div>
    <h2 className="mwnw-thankyou-title">You&apos;re All Set!</h2>
    <p className="mwnw-thankyou-text">
      Thank you for using Game Datacards. Have feedback or suggestions? Join our Discord community!
    </p>
    <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="mwnw-discord-link">
      <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Join our Discord" />
    </a>
  </div>
);

export default StepThankYou;
