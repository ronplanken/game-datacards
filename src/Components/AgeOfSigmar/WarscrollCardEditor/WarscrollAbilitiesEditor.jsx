import { Trash2 } from "lucide-react";
import { Form, Input, Button, Select, Switch, Card, Row, Col } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { v4 as uuidv4 } from "uuid";

const { TextArea } = Input;
const { Option } = Select;

export function WarscrollAbilitiesEditor() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const abilities = activeCard.abilities || [];

  const updateAbility = (index, field, value) => {
    const newAbilities = [...abilities];
    newAbilities[index] = { ...newAbilities[index], [field]: value };
    updateActiveCard({
      ...activeCard,
      abilities: newAbilities,
    });
  };

  const addAbility = () => {
    const newAbility = {
      id: uuidv4(),
      name: "New Ability",
      phase: "Passive",
      phaseDetails: "",
      icon: "special",
      lore: "",
      declare: "",
      effect: "",
      keywords: [],
      isReaction: false,
    };
    updateActiveCard({
      ...activeCard,
      abilities: [...abilities, newAbility],
    });
  };

  const removeAbility = (index) => {
    const newAbilities = abilities.filter((_, i) => i !== index);
    updateActiveCard({
      ...activeCard,
      abilities: newAbilities,
    });
  };

  return (
    <>
      {abilities.map((ability, index) => (
        <Card
          key={ability.id || index}
          type={"inner"}
          size={"small"}
          title={ability.name || `Ability ${index + 1}`}
          style={{ marginBottom: "16px" }}
          extra={
            <Button type={"text"} size={"small"} icon={<Trash2 size={14} />} onClick={() => removeAbility(index)} />
          }>
          <Form>
            <Form.Item label={"Name"}>
              <Input value={ability.name} onChange={(e) => updateAbility(index, "name", e.target.value)} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={"Phase"}>
                  <Select value={ability.phase || "Passive"} onChange={(value) => updateAbility(index, "phase", value)}>
                    <Option value="Passive">Passive</Option>
                    <Option value="Your Hero Phase">Your Hero Phase</Option>
                    <Option value="Enemy Hero Phase">Enemy Hero Phase</Option>
                    <Option value="Movement Phase">Movement Phase</Option>
                    <Option value="Shooting Phase">Shooting Phase</Option>
                    <Option value="Charge Phase">Charge Phase</Option>
                    <Option value="Combat Phase">Combat Phase</Option>
                    <Option value="Any Charge Phase">Any Charge Phase</Option>
                    <Option value="Any Combat Phase">Any Combat Phase</Option>
                    <Option value="End of Turn">End of Turn</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={"Icon"}>
                  <Select value={ability.icon || "special"} onChange={(value) => updateAbility(index, "icon", value)}>
                    <Option value="offensive">Offensive (Swords)</Option>
                    <Option value="defensive">Defensive (Shield)</Option>
                    <Option value="special">Special (Star)</Option>
                    <Option value="movement">Movement</Option>
                    <Option value="shooting">Shooting</Option>
                    <Option value="control">Control (Flag)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={"Phase Details"}>
              <Input
                value={ability.phaseDetails}
                onChange={(e) => updateAbility(index, "phaseDetails", e.target.value)}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={"Is Reaction"}>
                  <Switch
                    checked={ability.isReaction || false}
                    onChange={(value) => updateAbility(index, "isReaction", value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={"Casting/Chant Value"}>
                  <Input
                    type={"number"}
                    value={ability.castingValue || ability.chantValue}
                    onChange={(e) =>
                      updateAbility(index, "castingValue", e.target.value ? parseInt(e.target.value) : null)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={"Lore"}>
              <TextArea rows={2} value={ability.lore} onChange={(e) => updateAbility(index, "lore", e.target.value)} />
            </Form.Item>
            <Form.Item label={"Declare"}>
              <TextArea
                rows={2}
                value={ability.declare}
                onChange={(e) => updateAbility(index, "declare", e.target.value)}
              />
            </Form.Item>
            <Form.Item label={"Effect"}>
              <TextArea
                rows={3}
                value={ability.effect}
                onChange={(e) => updateAbility(index, "effect", e.target.value)}
              />
            </Form.Item>
            <Form.Item label={"Keywords"}>
              <Input
                value={Array.isArray(ability.keywords) ? ability.keywords.join(", ") : ability.keywords}
                onChange={(e) =>
                  updateAbility(
                    index,
                    "keywords",
                    e.target.value.split(",").map((k) => k.trim())
                  )
                }
              />
            </Form.Item>
          </Form>
        </Card>
      ))}
      <Button type={"dashed"} style={{ width: "100%" }} onClick={addAbility}>
        Add ability
      </Button>
    </>
  );
}
