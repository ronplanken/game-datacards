import { Database, AlertTriangle, Circle, CheckCircle2 } from "lucide-react";

const GAME_SYSTEMS = [
  {
    id: "40k-10e",
    name: "Warhammer 40,000",
    edition: "10th Edition",
    color: "#8b2020",
    colorLight: "rgba(139, 32, 32, 0.15)",
    colorBorder: "rgba(139, 32, 32, 0.5)",
  },
  {
    id: "aos",
    name: "Age of Sigmar",
    edition: "4th Edition",
    color: "#c9a227",
    colorLight: "rgba(201, 162, 39, 0.12)",
    colorBorder: "rgba(201, 162, 39, 0.5)",
  },
];

export const StepGameSystem = ({ selectedSystem, onSelect }) => {
  return (
    <div className="mww-gamesystem">
      <header className="mww-gamesystem-header">
        <div className="mww-gamesystem-icon">
          <Database />
        </div>
        <h1 className="mww-gamesystem-title">Choose Your Datasource</h1>
        <p className="mww-gamesystem-subtitle">
          Select the game system you want to browse. This determines which unit cards and army lists are available.
        </p>
      </header>

      <div className="mww-gamesystem-options">
        {GAME_SYSTEMS.map((system, index) => {
          const isSelected = selectedSystem === system.id;
          return (
            <button
              key={system.id}
              className={`mww-gamesystem-card ${isSelected ? "mww-gamesystem-card--selected" : ""}`}
              onClick={() => onSelect(system.id)}
              type="button"
              style={{
                "--system-color": system.color,
                "--system-color-light": system.colorLight,
                "--system-color-border": system.colorBorder,
                animationDelay: `${0.1 + index * 0.05}s`,
              }}>
              <div className="mww-gamesystem-card-marker" />
              <div className="mww-gamesystem-card-content">
                <span className="mww-gamesystem-card-name">{system.name}</span>
                <span className="mww-gamesystem-card-edition">{system.edition}</span>
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
