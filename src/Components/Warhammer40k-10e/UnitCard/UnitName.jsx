import { UnitPoints } from "./UnitPoints";

export const UnitName = ({ name, subname, points, legends, combatPatrol }) => {
  return (
    <div className="header_container">
      <div className="name_container">
        <div className="name">{name}</div>
        {subname && <div className="subname">{subname}</div>}
      </div>
      {legends && <div className="legends" />}
      {combatPatrol && <div className="combatpatrol" />}
      <UnitPoints points={points} />
    </div>
  );
};
