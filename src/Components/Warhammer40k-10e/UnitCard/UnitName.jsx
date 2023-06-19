import { UnitPoints } from "./UnitPoints";

export const UnitName = ({ name, subname, points }) => {
  return (
    <div className="header_container">
      <div className="name_container">
        <div className="name">{name}</div>
        {subname && <div className="subname">{subname}</div>}
      </div>
      <UnitPoints points={points} />
    </div>
  );
};
