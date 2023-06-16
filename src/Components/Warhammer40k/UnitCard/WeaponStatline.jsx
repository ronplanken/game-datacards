import { MarkdownDisplay } from "../../MarkdownDisplay";
import { WeaponStatProfile } from "./WeaponStatProfile";

export const WeaponStatline = ({ profile, type = "card", icons = "icons", nested = false }) => {
  if (!profile) {
    return <></>;
  }
  return (
    <div className={`weapon ${nested ? "nested" : ""}`}>
      <div className="weapon_profile">
        <div
          className="left value"
          style={{
            whiteSpace: profile.wrapName ? "wrap" : "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
          {profile.name.replace("(melee)", "").replace("(shooting)", "")}
        </div>
        <div
          className="center value"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
          {profile.Range === "Melee" && icons !== "no-icons" ? (
            <div style={{ width: 11, height: 11 }} className="icon melee"></div>
          ) : (
            profile.Range
          )}
        </div>
        <div
          className="center value"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
          {icons !== "no-icons" ? (
            <WeaponStatProfile type={profile.type} />
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>{profile.type}</div>
          )}
        </div>
        <div className="center value">{profile.S}</div>
        <div className="center value">{profile.AP}</div>
        <div className="center value">{profile.D}</div>
      </div>
      {profile.abilities && (
        <div className="weapon_desc">
          <MarkdownDisplay content={profile.abilities} />
        </div>
      )}
    </div>
  );
};
