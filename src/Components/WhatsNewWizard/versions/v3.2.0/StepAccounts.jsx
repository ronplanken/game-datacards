import React from "react";
import { UserCircle } from "lucide-react";

/**
 * StepAccounts - User Accounts feature step for v3.2.0
 *
 * Highlights account creation, sign-in location, and optional 2FA.
 *
 * @returns {JSX.Element} User Accounts feature step content
 */
export const StepAccounts = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <UserCircle size={28} />
      </div>
      <h2 className="wnw-feature-title">User Accounts</h2>
    </div>
    <p className="wnw-feature-description">
      Create a free account to unlock cloud sync and keep your datacards safe across devices.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Sign Up / Sign In</strong>
          <p>Create an account with your email or sign in to an existing one</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Account Button</strong>
          <p>Find the account button in the top-right corner to manage your profile and settings</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Optional 2FA</strong>
          <p>Enable two-factor authentication for extra security on your account</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepAccounts;
