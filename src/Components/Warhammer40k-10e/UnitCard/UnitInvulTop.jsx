export const UnitInvulTop = ({ invul }) => {
  return (
    <div className="invul_container">
      <div className="invul">
        <div className="value_container">
          <div className="value">{invul?.value}</div>
        </div>
        <div className="title">Invulnerable save {invul.showInfo && "*"}</div>
      </div>
      {invul?.info && invul.showInfo && <div className="info">{invul?.info}</div>}
    </div>
  );
};
