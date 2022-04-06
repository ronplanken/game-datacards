import React from 'react';
import { ProfileOutlined } from '@ant-design/icons';
import { useCardStorage } from '../Hooks/useCardStorage';

export function TreeItem({ card, category, selectedTreeIndex, setSelectedTreeIndex }) {
  const { setActiveCard, setActiveCategory } = useCardStorage();
  const cardIndex = `card-${card.uuid}`;
  return (
    <div
      style={{
        paddingLeft: 24,
        height: 24,
        fontSize: '14px',
        alignContent: 'center',
        display: 'flex',
        width: '100%',
      }}
      key={cardIndex}
      className={['tree-item-container', selectedTreeIndex === cardIndex ? 'selected' : ''].join(' ')}
    >
      <div
        onClick={() => {
          if (selectedTreeIndex === cardIndex) {
            setSelectedTreeIndex(null);
            setActiveCard(null);
            setActiveCategory(null);
          } else {
            setSelectedTreeIndex(cardIndex);
            setActiveCard(card);
            setActiveCategory(category);
          }
        }}
        className={'tree-item'}
      >
        <ProfileOutlined /> {card.name}
      </div>
    </div>
  );
}
