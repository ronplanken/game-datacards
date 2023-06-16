export const UnitName = ({ name, subname }) => {
  return (
    <div className="name_container">
      <div className="name">{name}</div>
      {subname && <div className="subname">{subname}</div>}
    </div>
  );
};
