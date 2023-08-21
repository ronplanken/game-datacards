import { UnitPoints } from "./UnitPoints";

export const UnitName = ({ name, subname, points, legends }) => {
  return (
    <div className="header_container">
      <div className="name_container">
        <div className="name">{name}</div>
        {subname && <div className="subname">{subname}</div>}
      </div>
      {legends && <div className="legends" />}
      <UnitPoints points={points} />
    </div>
  );
};
