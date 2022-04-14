import ReactMarkdown from 'react-markdown';
import { UnitStatline } from './UnitCard/UnitStatline';
import { UnitType } from './UnitCard/UnitType';
import { WeaponStatline } from './UnitCard/WeaponStatline';

export const UnitCard = ({ unit, style, cardStyle }) => {
  return (
    <div style={{ paddingTop: '32px', justifyContent: 'center', justifyItems: 'center', display: 'flex', ...style }}>
      <div className='page' style={cardStyle}>
        <div className='frame'>
          <div className='header'>
            <div className='role'>
              <UnitType type={unit.role} />
            </div>
            <div className='name'>{unit.name}</div>
          </div>
          {unit.datasheet?.filter( (sheet) => sheet.active).length > 0 && (
            <div className='labels heading'>
              <div className='center label'>
                <div className='movement' id='icon' title='Movement' alt-text='Movement'></div>
              </div>
              <div className='center label'>
                <div className='weaponskill' id='icon' title='Weapon Skill' alt-text='Weapon Skill'></div>
              </div>
              <div className='center label'>
                <div className='ballisticskill' id='icon' title='Ballistic Skill' alt-text='Ballistic Skill'></div>
              </div>
              <div className='center label'>
                <div className='strength' id='icon' title='Strength' alt-text='Strength'></div>
              </div>
              <div className='center label'>
                <div className='toughness' id='icon' title='Toughness' alt-text='Toughness'></div>
              </div>
              <div className='center label'>
                <div className='wounds' id='icon' title='Wounds' alt-text='Wounds'></div>
              </div>
              <div className='center label'>
                <div className='attacks' id='icon' title='Attacks' alt-text='Attacks'></div>
              </div>
              <div className='center label'>
                <div className='leadership' id='icon' title='Leadership' alt-text='Leadership'></div>
              </div>
              <div className='center label'>
                <div className='save' id='icon' title='Save' alt-text='Save'></div>
              </div>
              <div className='center label'>
                <div className='inv' id='icon' title='Invulnerable' alt-text='Save'></div>
              </div>
            </div>
          )}
          <div className='profile'>
            {unit.datasheet?.map((datasheet, index) => {
              if (datasheet.active) {
                return <UnitStatline statline={datasheet} key={`datasheet-${index}`} />;
              } else {
                return <></>;
              }
            })}
          </div>
          <div className='description'>
            <ReactMarkdown>{unit.unit_composition}</ReactMarkdown>
          </div>
          {unit.wargear?.filter( (sheet) => sheet.active).length > 0 && (
            <div className='weapons heading'>
              <div className='left label'>WEAPON</div>
              <div className='center label'>
                <div className='range' id='icon' title='Range' alt-text='Range'></div>
              </div>
              <div className='center label'>
                <div className='type' id='icon' title='Type' alt-text='Type'></div>
              </div>
              <div className='center label'>
                <div className='strength' id='icon' title='Type' alt-text='Type'></div>
              </div>
              <div className='center label'>
                <div className='ap' id='icon' title='Type' alt-text='Type'></div>
              </div>
              <div className='center label'>
                <div className='dmg' id='icon' title='Type' alt-text='Type'></div>
              </div>
            </div>
          )}
          <div className='profile'>
            {unit.wargear?.map((wargear, index) => {
              if (!wargear.active) {
                return <></>;
              }
              if (wargear.profiles.length > 1) {
                return (
                  <>
                    <div className='description' key={`profile-${index}-description`}>
                      {wargear.name}
                    </div>
                    {wargear.profiles.map((profile, pindex) => {
                      return <WeaponStatline profile={profile} key={`profile-${index}-${pindex}`} />;
                    })}
                  </>
                );
              }
              return <WeaponStatline profile={wargear.profiles[0]} key={`profile-${index}`} />;
            })}
          </div>
          <div className='abilities'>
            {unit.abilities?.map((ability, index) => {
              return (
                ability.showAbility && (
                  <div className='description' key={`ability-${ability.name}-description-${index}`}>
                    {!ability.showDescription && <b>{ability.name}</b>}
                    {ability.showDescription && (
                      <ReactMarkdown>{`**${ability.name}** : ${ability.description}`}</ReactMarkdown>
                    )}
                  </div>
                )
              );
            })}
          </div>
          <div className='footer'>
            {unit.keywords
              ?.filter((keyword) => keyword.active)
              .map((keyword) => keyword.keyword)
              .join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
};