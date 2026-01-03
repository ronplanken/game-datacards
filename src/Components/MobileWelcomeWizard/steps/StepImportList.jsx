import { Upload, Smartphone, FileInput } from "lucide-react";

export const StepImportList = () => {
  return (
    <div className="mww-info-step">
      <header className="mww-info-header">
        <div className="mww-info-icon">
          <Upload />
        </div>
        <h1 className="mww-info-title">Import Your Army List</h1>
        <p className="mww-info-subtitle">Easily import your army list from the official Warhammer 40,000 App.</p>
      </header>

      <div className="mww-info-steps">
        <div className="mww-info-step-item">
          <div className="mww-info-step-number">1</div>
          <div className="mww-info-step-content">
            <div className="mww-info-step-title">Open the Warhammer App</div>
            <div className="mww-info-step-desc">Navigate to your army list in the official app</div>
          </div>
          <div className="mww-info-step-icon">
            <Smartphone />
          </div>
        </div>

        <div className="mww-info-step-item">
          <div className="mww-info-step-number">2</div>
          <div className="mww-info-step-content">
            <div className="mww-info-step-title">Export list</div>
            <div className="mww-info-step-desc">Use the export button or copy the list to your clipboard</div>
          </div>
          <div className="mww-info-step-icon">
            <FileInput />
          </div>
        </div>

        <div className="mww-info-step-item">
          <div className="mww-info-step-number">3</div>
          <div className="mww-info-step-content">
            <div className="mww-info-step-title">Paste in Game Datacards</div>
            <div className="mww-info-step-desc">Use the import feature to load your units</div>
          </div>
          <div className="mww-info-step-icon">
            <Upload />
          </div>
        </div>
      </div>

      <p className="mww-info-note">You can import lists anytime from the list menu after setup.</p>
    </div>
  );
};
