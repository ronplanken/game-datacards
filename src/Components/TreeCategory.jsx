import React from 'react';
import { FolderOutlined } from '@ant-design/icons';
import { useCardStorage } from '../Hooks/useCardStorage';

export function TreeCategory({
  category,
  selectedTreeIndex,
  setSelectedTreeIndex,
}) {
  const { setActiveCard, setActiveCategory } = useCardStorage();
  return (
    <div
      style={{
        paddingLeft: 8,
        height: 24,
        fontSize: '14px',
        alignContent: 'center',
        display: 'flex',
        width: '100%',
      }}
      className={['tree-item-container', selectedTreeIndex === `cat-${category.uuid}` ? 'selected' : ''].join(' ')}
      onClick={() => {
        if (selectedTreeIndex === `cat-${category.uuid}`) {
          setSelectedTreeIndex(null);
          setActiveCard(null);
          setActiveCategory(null);
        } else {
          setSelectedTreeIndex(`cat-${category.uuid}`);
          setActiveCard(null);
          setActiveCategory(category);
        }
      }}
    >
      <div className={'tree-item'}>
        <FolderOutlined /> {category.name}
      </div>
    </div>
  );
}
