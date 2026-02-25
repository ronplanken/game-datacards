import logo from "../../Images/logo.png";
import "./MobileGameSystemSelector.css";

export const MobileGameSystemSelector = ({ onSelect }) => {
  return (
    <div className="gss">
      <div className="gss-content">
        <header className="gss-header">
          <img src={logo} alt="Game Datacards" className="gss-logo" />
          <h1 className="gss-title">Game Datacards</h1>
        </header>

        <div className="gss-options">
          <button className="gss-option gss-option-40k" onClick={() => onSelect("40k-10e")} type="button">
            <div className="gss-option-marker" />
            <div className="gss-option-content">
              <span className="gss-option-name">Warhammer 40,000</span>
              <span className="gss-option-meta">10th Edition</span>
            </div>
            <svg className="gss-option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <button className="gss-option gss-option-aos" onClick={() => onSelect("aos")} type="button">
            <div className="gss-option-marker" />
            <div className="gss-option-content">
              <span className="gss-option-name">Age of Sigmar</span>
              <span className="gss-option-meta">4th Edition</span>
            </div>
            <svg className="gss-option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <footer className="gss-footer">
          <p>Select a game system to continue.</p>
          <p>Switch anytime in settings.</p>
        </footer>
      </div>
    </div>
  );
};
