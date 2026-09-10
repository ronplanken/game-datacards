import { InvulnShieldSvg } from "../../Icons/InvulnShield";

// 11th edition invulnerable saves are a simple { value } object.
export const UnitInvul = ({ invul }) => {
  return (
    <div className="invul_container">
      <div className="invul">
        <div className="title">Invulnerable save</div>
        <div className="value_container">
          <InvulnShieldSvg fill="var(--banner-colour)" className="invul-shield-outer" />
          <div className="value">
            <InvulnShieldSvg fill="white" className="invul-shield-inner" />
            <span className="value-text">{invul?.value}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
