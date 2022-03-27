import { WeaponStatProfile } from './WeaponStatProfile';

export const WeaponStatline = ({ profile }) => {
  if(!profile) {
    return <></>;
  }
  return (
    <div className='weapon'>
      <div className='weapon_profile'>
        <div className='left' id='value' style={{ whiteSpace: profile.wrapName ? 'wrap' : 'nowrap' , overflow: "hidden", textOverflow: "ellipsis"}}>
          {profile.name.replace('(melee)', '').replace('(shooting)', '')}
        </div>
        <div className='center' id='value' style={{ whiteSpace: 'nowrap', overflow: "hidden", textOverflow: "ellipsis" }}>
          {profile.Range === 'Melee' ? <div style={{ width: 11, height: 11 }} className='melee'></div> : profile.Range}
        </div>
        <div className='center' id='value' style={{ whiteSpace: 'nowrap', overflow: "hidden", textOverflow: "ellipsis"  }}>
          <WeaponStatProfile type={profile.type} />
        </div>
        <div className='center' id='value'>
          {profile.S}
        </div>
        <div className='center' id='value'>
          {profile.AP}
        </div>
        <div className='center' id='value'>
          {profile.D}
        </div>
      </div>
      {profile.abilities && <div className='weapon_desc'>{profile.abilities.replace(/(<([^>]+)>)/gi, '')}</div>}
    </div>
  );
};
