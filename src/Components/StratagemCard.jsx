import ReactMarkdown from 'react-markdown';
import { UnitStatline } from './UnitCard/UnitStatline';
import { UnitType } from './UnitCard/UnitType';
import { WeaponStatline } from './UnitCard/WeaponStatline';

export const StratagemCard = ({ stratagem, style, cardStyle, paddingTop = '32px' }) => {
  return (
    <div style={{ paddingTop, justifyContent: 'center', justifyItems: 'center', display: 'flex' }}>
      <div className={`page ${stratagem.variant || 'card'}`} style={cardStyle}>
        <div className='frame'>
          <div className='header'>
            <div className='role'>
              <div className='stratagem'>
                {stratagem.cp_cost}CP
              </div>
            </div>
            <div className='name'>{stratagem.name}</div>
          </div>
          <div className='description'>
            <ReactMarkdown>{stratagem.description}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
