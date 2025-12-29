import { InvulnShieldSvg } from "../../Icons/InvulnShield";

export const UnitInvul = ({ invul }) => {
  return (
    <div className="invul_container">
      <div className="invul">
        <div className="title">Invulnerable save {invul.showInfo && "*"}</div>
        <div className="value_container">
          <InvulnShieldSvg fill="var(--banner-colour)" className="invul-shield-outer" />
          <div className="value">
            <InvulnShieldSvg fill="white" className="invul-shield-inner" />
            <span className="value-text">{invul?.value}</span>
          </div>
        </div>
      </div>
      {invul?.info && invul.showInfo && <div className="info">{invul?.info}</div>}
    </div>
  );
};
