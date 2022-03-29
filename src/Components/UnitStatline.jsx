export const UnitStatline = ({ statline }) => {
  return (
    <div className='statline'>
      <div className='center' id='value'>
        {statline.M}
      </div>
      <div className='center' id='value'>
        {statline.WS}
      </div>
      <div className='center' id='value'>
        {statline.BS}
      </div>
      <div className='center' id='value'>
        {statline.S}
      </div>
      <div className='center' id='value'>
        {statline.T}
      </div>
      <div className='center' id='value'>
        {statline.W}
      </div>
      <div className='center' id='value'>
        {statline.A}
      </div>
      <div className='center' id='value'>
        {statline.Ld}
      </div>
      <div className='center' id='value'>
        {statline.Sv}
      </div>
      <div className='center' id='value'>
        {statline.Inv}
      </div>
    </div>
  );
};
