export const UnitType = ({ type }) => {
  switch (type) {
    case 'HQ':
      return <div className='hq' title='HQ' alt-text='HQ' />;
    case 'Troops':
      return <div className='troops' title='Troops' alt-text='Troops' />;
    case 'Elites':
      return <div className='elites' title='Elites' alt-text='Elites' />;
    case 'Heavy Support':
      return <div className='heavy-support' title='Heavy Support' alt-text='Heavy Support' />;
    case 'Fast Attack':
      return <div className='fast-attack' title='Fast Attack' alt-text='Fast Attack' />;
    case 'Dedicated Transport':
      return <div className='dedicated-transport' title='Dedicated Transport' alt-text='Dedicated Transport' />;
    case 'Flyers':
      return <div className='flyer' title='Flyers' alt-text='Flyers' />;
    case 'Fortifications':
      return <div className='fortification' title='Fortifications' alt-text='Fortifications' />;
    case 'Lords of War':
      return <div className='lord-of-war' title='Lords of War' alt-text='Lords of War' />;
    default:
      return <div className='unknown' title='Unknown' alt-text='Unknown' />;
  }
};
