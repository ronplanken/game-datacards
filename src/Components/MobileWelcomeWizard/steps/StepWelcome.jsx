import logo from "../../../Images/logo.png";
import { Smartphone, Layers, Share2 } from "lucide-react";

export const StepWelcome = () => {
  return (
    <div className="mww-welcome">
      <header className="mww-welcome-header">
        <img src={logo} alt="Game Datacards" className="mww-welcome-logo" />
        <h1 className="mww-welcome-title">Welcome to Game Datacards</h1>
        <p className="mww-welcome-subtitle">Your army lists and unit cards, always in your pocket.</p>
      </header>

      <div className="mww-welcome-features">
        <div className="mww-welcome-feature">
          <div className="mww-welcome-feature-icon">
            <Layers />
          </div>
          <div className="mww-welcome-feature-text">
            <div className="mww-welcome-feature-title">Browse Units</div>
            <div className="mww-welcome-feature-desc">Access all datacards for your chosen game system</div>
          </div>
        </div>

        <div className="mww-welcome-feature">
          <div className="mww-welcome-feature-icon">
            <Smartphone />
          </div>
          <div className="mww-welcome-feature-text">
            <div className="mww-welcome-feature-title">Mobile Optimized</div>
            <div className="mww-welcome-feature-desc">Designed for quick reference during games</div>
          </div>
        </div>

        <div className="mww-welcome-feature">
          <div className="mww-welcome-feature-icon">
            <Share2 />
          </div>
          <div className="mww-welcome-feature-text">
            <div className="mww-welcome-feature-title">Create Lists</div>
            <div className="mww-welcome-feature-desc">Build and share your army lists with others</div>
          </div>
        </div>
      </div>
    </div>
  );
};
