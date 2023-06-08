export const UnitAbilityDescription = ({ name, description, showDescription }) => {
  return (
    <div className="ability">
      <span className="name">{name}</span>
      {showDescription && <span className="description">{description}</span>}
    </div>
  );
};
