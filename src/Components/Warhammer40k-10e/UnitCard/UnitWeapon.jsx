export const UnitWeapon = ({ weapon }) => {
  return (
    <div className="weapon">
      {weapon.profiles
        ?.filter((line) => line.active)
        ?.map((line, index) => (
          <div className="line" key={`weapon-line-${index}`}>
            <div className="value">
              {line.name}
              {` `}
              {line.keywords?.length > 0 && <span className="keyword">{line.keywords.join(", ")}</span>}
            </div>
            <div className="value center">{line.range}</div>
            <div className="value center">{line.attacks}</div>
            <div className="value center">{line.skill}</div>
            <div className="value center">{line.strength}</div>
            <div className="value center">{line.ap}</div>
            <div className="value center">{line.damage}</div>
          </div>
        ))}
    </div>
  );
};
