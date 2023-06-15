export const UnitAbilityDescription = ({ name, description, showDescription }) => {
  if (description.includes("■")) {
    return (
      <div className="ability">
        <span className="name">{name}</span>
        {showDescription && (
          <span className="description">
            {description.split("■").map((line, index) => (
              <div key={index}>
                {index > 0 ? "■" : ""}
                {line}
              </div>
            ))}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="ability">
      <span className="name">{name}</span>
      {showDescription && <span className="description">{description}</span>}
    </div>
  );
};
