import React from "react";
import { Heart } from "lucide-react";

/**
 * StepThankYou - Final step for v3.1.1
 *
 * Thanks users and invites them to try the new features.
 *
 * @returns {JSX.Element} Thank you step content
 */
export const StepThankYou = () => (
  <div className="wnw-thankyou-content">
    <div className="wnw-thankyou-icon">
      <Heart size={48} />
    </div>
    <h3 className="wnw-thankyou-title">Thank You!</h3>
    <p className="wnw-thankyou-description">
      Thank you for using Game Datacards! Your support helps us continue improving the application.
    </p>
    <p className="wnw-thankyou-cta">
      Try out the new detachment filtering in your Space Marines faction settings and let us know what you think.
    </p>
  </div>
);

export default StepThankYou;
