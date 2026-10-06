import { Database, AlertTriangle, Circle, CheckCircle2 } from "lucide-react";
import { PRIMARY_MOBILE_SYSTEMS } from "../../Viewer/mobileGameSystems";

const hexToRgba = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const StepGameSystem = ({ selectedSystem, onSelect }) => {
  return (
    <div className="mww-gamesystem">
      <header className="mww-gamesystem-header">
        <div className="mww-gamesystem-icon">
          <Database />
        </div>
        <h1 className="mww-gamesystem-title">Choose Your Game System</h1>
        <p className="mww-gamesystem-subtitle">
          Select the game system you want to browse. This determines which unit cards and army lists are available.
        </p>
      </header>

      <div className="mww-gamesystem-options">
        {PRIMARY_MOBILE_SYSTEMS.map((system, index) => {
          const isSelected = selectedSystem === system.id;
          const name = system.longName ?? system.name;
          const edition = system.longMeta ?? system.meta;
          return (
            <button
              key={system.id}
              className={`mww-gamesystem-card ${isSelected ? "mww-gamesystem-card--selected" : ""}`}
              onClick={() => onSelect(system.id)}
              type="button"
              style={{
                "--system-color": system.color,
                "--system-color-light": hexToRgba(system.color, 0.15),
                "--system-color-border": hexToRgba(system.color, 0.5),
                animationDelay: `${0.1 + index * 0.05}s`,
              }}>
              <div className="mww-gamesystem-card-marker" />
              <div className="mww-gamesystem-card-content">
                <span className="mww-gamesystem-card-name">{name}</span>
                <span className="mww-gamesystem-card-edition">{edition}</span>
              </div>
              <div className="mww-gamesystem-card-check">{isSelected ? <CheckCircle2 /> : <Circle />}</div>
            </button>
          );
        })}
      </div>

      <div className="mww-gamesystem-warning">
        <AlertTriangle />
        <p>
          All game data is retrieved from external community sources and is not hosted by Game Datacards. Data accuracy
          depends on community maintainers.
        </p>
      </div>
    </div>
  );
};
