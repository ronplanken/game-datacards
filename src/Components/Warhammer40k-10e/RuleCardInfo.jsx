import { Card, Typography } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";

const { Title, Text } = Typography;

export const RuleCardInfo = () => {
  const { activeCard } = useCardStorage();

  if (!activeCard || activeCard.cardType !== "rule") {
    return null;
  }

  return (
    <Card size="small" style={{ margin: "8px" }}>
      <Title level={5} style={{ marginTop: 0 }}>
        {activeCard.name}
      </Title>
      <Text type="secondary">
        {activeCard.ruleType === "army" ? "Army Rule" : `${activeCard.detachment || "Detachment"} Rule`}
      </Text>
      <div style={{ marginTop: "16px" }}>
        <Text type="secondary" italic>
          Rules are read-only and cannot be edited.
        </Text>
      </div>
    </Card>
  );
};
