export const UnitType = ({ type }) => {
  switch (type) {
    case "HQ":
      return <div className="hq" title="HQ" />;
    case "Troops":
      return <div className="troops" title="Troops" />;
    case "Elites":
      return <div className="elites" title="Elites" />;
    case "Heavy Support":
      return <div className="heavy-support" title="Heavy Support" />;
    case "Fast Attack":
      return <div className="fast-attack" title="Fast Attack" />;
    case "Dedicated Transport":
      return <div className="dedicated-transport" title="Dedicated Transport" />;
    case "Flyers":
      return <div className="flyer" title="Flyers" />;
    case "Fortifications":
      return <div className="fortification" title="Fortifications" />;
    case "Lords of War":
      return <div className="lord-of-war" title="Lords of War" />;
    default:
      return <div className="unknown" title="Unknown" />;
  }
};
