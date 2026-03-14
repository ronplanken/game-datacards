import logo from "../../Images/logo.png";
import { SELECTOR_SYSTEMS } from "./mobileDatasourceConfig";
import "./MobileGameSystemSelector.css";

export const MobileGameSystemSelector = ({
  onSelect,
  customDatasources = [],
  subscribedDatasources = [],
  localDatasources = [],
  datasourceColours = {},
}) => {
  // Separate owned custom datasources (non-subscribed)
  const ownedDatasources = customDatasources.filter((ds) => !ds.isSubscribed);

  // Combine local + owned custom into "Your Datasources"
  const yourDatasources = [
    ...localDatasources.map((ds) => ({
      id: `local-ds-${ds.uuid}`,
      name: ds.name,
      colour: ds.colours?.banner || null,
    })),
    ...ownedDatasources.map((ds) => ({ id: ds.id, name: ds.name, colour: datasourceColours[ds.id] || null })),
  ];

  // Subscribed datasources from custom list
  const subscribed = subscribedDatasources.map((ds) => ({
    id: ds.id,
    name: ds.name,
    colour: datasourceColours[ds.id] || null,
  }));

  return (
    <div className="gss">
      <div className="gss-content">
        <header className="gss-header">
          <img src={logo} alt="Game Datacards" className="gss-logo" />
          <h1 className="gss-title">Game Datacards</h1>
        </header>

        <div className="gss-options">
          {/* Built-in systems */}
          {SELECTOR_SYSTEMS.map((system) => (
            <button
              key={system.id}
              className={`gss-option ${system.cssClass}`}
              onClick={() => onSelect(system.id)}
              type="button">
              <div className="gss-option-marker" />
              <div className="gss-option-content">
                <span className="gss-option-name">{system.name}</span>
                {system.meta && <span className="gss-option-meta">{system.meta}</span>}
              </div>
              <svg className="gss-option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}

          {/* Your Datasources section */}
          {yourDatasources.length > 0 && (
            <>
              <div className="gss-section-title">Your Datasources</div>
              {yourDatasources.map((ds) => (
                <button
                  key={ds.id}
                  className="gss-option gss-option-custom"
                  onClick={() => onSelect(ds.id)}
                  type="button">
                  <div className="gss-option-marker" style={{ background: ds.colour || "#4a6fa5" }} />
                  <div className="gss-option-content">
                    <span className="gss-option-name">{ds.name}</span>
                  </div>
                  <svg
                    className="gss-option-arrow"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </>
          )}

          {/* Subscribed section */}
          {subscribed.length > 0 && (
            <>
              <div className="gss-section-title">Subscribed</div>
              {subscribed.map((ds) => (
                <button
                  key={ds.id}
                  className="gss-option gss-option-custom"
                  onClick={() => onSelect(ds.id)}
                  type="button">
                  <div className="gss-option-marker" style={{ background: ds.colour || "#4a6fa5" }} />
                  <div className="gss-option-content">
                    <span className="gss-option-name">{ds.name}</span>
                  </div>
                  <svg
                    className="gss-option-arrow"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </>
          )}
        </div>

        <footer className="gss-footer">
          <p>Select a game system to continue.</p>
          <p>Switch anytime in settings.</p>
        </footer>
      </div>
    </div>
  );
};
