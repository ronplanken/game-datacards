export const UnitStatline = ({ statline }) => {
  return (
    <div className="statline">
      <div className="center value">
        {statline.M}
      </div>
      <div className="center value">
        {statline.WS}
      </div>
      <div className="center value">
        {statline.BS}
      </div>
      <div className="center value">
        {statline.S}
      </div>
      <div className="center value">
        {statline.T}
      </div>
      <div className="center value">
        {statline.W}
      </div>
      <div className="center value">
        {statline.A}
      </div>
      <div className="center value">
        {statline.Ld}
      </div>
      <div className="center value">
        {statline.Sv}
      </div>
      <div className="center value">
        {statline.Inv}
      </div>
    </div>
  );
};
