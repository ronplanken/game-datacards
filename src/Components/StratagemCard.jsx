import ReactMarkdown from 'react-markdown';

export const StratagemCard = ({ stratagem, style, cardStyle, paddingTop = '32px' }) => {
  return (
    <div style={{ paddingTop, justifyContent: 'center', justifyItems: 'center', display: 'flex' }}>
      <div className={`page ${stratagem.variant || 'card'}`} style={cardStyle}>
        <div className='frame'>
          <div className='header'>
            <div className='role'>
              <div className='stratagem'>
                <span>{stratagem.cp_cost}CP</span>
              </div>
            </div>
            <div className='name'>
              {stratagem.name} <div className='stratagem_type'>{stratagem.type}</div>
            </div>
          </div>
          <div className='description'>
            <ReactMarkdown>{stratagem.description}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
