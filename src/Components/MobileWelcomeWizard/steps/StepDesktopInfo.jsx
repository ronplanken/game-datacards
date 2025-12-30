import { Monitor, Palette, Printer, FolderOpen } from "lucide-react";

export const StepDesktopInfo = () => {
  return (
    <div className="mww-info-step">
      <header className="mww-info-header">
        <div className="mww-info-icon mww-info-icon--desktop">
          <Monitor />
        </div>
        <h1 className="mww-info-title">Full Desktop Experience</h1>
        <p className="mww-info-subtitle">
          Visit Game Datacards on desktop for the complete list builder with advanced features.
        </p>
      </header>

      <div className="mww-desktop-features">
        <div className="mww-desktop-feature">
          <div className="mww-desktop-feature-icon">
            <FolderOpen />
          </div>
          <div className="mww-desktop-feature-text">
            <div className="mww-desktop-feature-title">Custom List Builder</div>
            <div className="mww-desktop-feature-desc">Build and organize your army lists with drag &amp; drop</div>
          </div>
        </div>

        <div className="mww-desktop-feature">
          <div className="mww-desktop-feature-icon">
            <Palette />
          </div>
          <div className="mww-desktop-feature-text">
            <div className="mww-desktop-feature-title">Card Customization</div>
            <div className="mww-desktop-feature-desc">Edit colors, text, and layouts to match your army</div>
          </div>
        </div>

        <div className="mww-desktop-feature">
          <div className="mww-desktop-feature-icon">
            <Printer />
          </div>
          <div className="mww-desktop-feature-text">
            <div className="mww-desktop-feature-title">Print &amp; Export</div>
            <div className="mww-desktop-feature-desc">Print physical cards or export as images</div>
          </div>
        </div>
      </div>

      <div className="mww-desktop-url">
        <span className="mww-desktop-url-label">Visit on desktop:</span>
        <span className="mww-desktop-url-value">game-datacards.eu</span>
      </div>
    </div>
  );
};
