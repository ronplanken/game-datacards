import { Alert, Col, Typography } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";

const { Paragraph } = Typography;

// 11th edition cards are read-only in this version. The 10e editor mutates
// flag-bearing fields (active/showAbility/...) that the multi-language 11e data
// does not have, so field editing is deferred. Cards can still be added to a
// category and printed/exported/shared.
export const Warhammer40K11eCardEditor = () => {
  const { activeCard } = useCardStorage();

  if (!activeCard) {
    return null;
  }

  return (
    <Col span={24} className={`card-editor`} style={{ padding: 16 }}>
      <Alert
        type="info"
        showIcon
        message="11th Edition cards are read-only"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            Editing of individual 11th Edition cards is not available yet. You can still add this card to a category and
            print, export or share it. Use the language selector in Settings to switch the card language.
          </Paragraph>
        }
      />
    </Col>
  );
};
