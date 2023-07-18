import { UnitPoints } from "./UnitPoints";

export const UnitName = ({ name, subname, points, legends }) => {
  return (
    <div className="header_container">
      <div className="name_container">
        <div className="name">{name}</div>
        {subname && <div className="subname">{subname}</div>}
      </div>
      {legends && (
        <div
          style={{
            position: "absolute",
            top: 38,
            right: 110,
            zIndex: 10,
            fontSize: "1.3rem",
            fontWeight: 600,
            fontFamily: "EB Garamond, serif",
            color: "var(--faction-text-colour)",
          }}>
          Warhammer Legends
        </div>
      )}
      <UnitPoints points={points} />
    </div>
  );
};
