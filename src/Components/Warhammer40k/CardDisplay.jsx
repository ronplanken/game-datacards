import { Col } from 'antd';
import { useCardStorage } from '../../Hooks/useCardStorage';
import { SecondaryCard } from './SecondaryCard';
import { StratagemCard } from './StratagemCard';
import { UnitCard } from './UnitCard';

export const Warhammer40KCardDisplay = () => {
  const { activeCard } = useCardStorage();

  return (
    activeCard && (
      <>
        <Col span={24}>
          {activeCard.cardType === "datasheet" && <UnitCard unit={activeCard} />}
          {activeCard.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
          {activeCard.cardType === "secondary" && <SecondaryCard secondary={activeCard} />}
        </Col>
      </>
    )
  );
};
