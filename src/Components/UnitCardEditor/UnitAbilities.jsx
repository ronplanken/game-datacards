import { DeleteFilled } from '@ant-design/icons';
import { Button, Card, Col, Popconfirm, Row, Space, Switch, Typography } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCardStorage } from '../../Hooks/useCardStorage';

export function UnitAbilities() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      {activeCard.abilities.map((ability, index) => {
        return (
          <Card
            key={`ability-${ability.id}-${index}`}
            type={'inner'}
            size={'small'}
            title={
              <Typography.Text
                ellipsis={{ rows: 1 }}
                editable={{
                  onChange: (value) => {
                    const newAbilities = [...activeCard.abilities];
                    newAbilities[index]['name'] = value;
                    updateActiveCard({ ...activeCard, abilities: newAbilities });
                  },
                }}
              >
                {ability.name}
              </Typography.Text>
            }
            bodyStyle={{ padding: 0 }}
            style={{ marginBottom: '16px' }}
            extra={
              <Space>
                <Popconfirm
                  title={'Are you sure you want to delete this ability?'}
                  placement='topRight'
                  onConfirm={(value) =>
                    updateActiveCard(() => {
                      const newAbilities = [...activeCard.abilities];
                      newAbilities.splice(index, 1);
                      return { ...activeCard, abilities: newAbilities };
                    })
                  }
                >
                  <Button type='icon' shape='circle' size='small' icon={<DeleteFilled />}></Button>
                </Popconfirm>
                <Switch
                  checked={ability.showAbility}
                  onChange={(value) => {
                    updateActiveCard(() => {
                      const newAbilities = [...activeCard.abilities];
                      newAbilities[index]['showAbility'] = value;
                      return { ...activeCard, abilities: newAbilities };
                    });
                  }}
                />
              </Space>
            }
          >
            {ability.showAbility && (
              <Row justify='space-between' align='middle'>
                <Col span={2} justify='center' style={{ textAlign: 'center' }}>
                  <Switch
                    checked={ability.showDescription}
                    onChange={(value) => {
                      updateActiveCard(() => {
                        const newAbilities = [...activeCard.abilities];
                        newAbilities[index]['showDescription'] = value;
                        return { ...activeCard, abilities: newAbilities };
                      });
                    }}
                  />
                </Col>
                <Col span={22}>
                  <TextArea
                    type='text'
                    value={ability.description}
                    name='description'
                    onChange={(e) => {
                      updateActiveCard(() => {
                        const newAbilities = [...activeCard.abilities];
                        newAbilities[index]['description'] = e.target.value;
                        return { ...activeCard, abilities: newAbilities };
                      });
                    }}
                  />
                </Col>
              </Row>
            )}
          </Card>
        );
      })}
      <Button
        type='dashed'
        style={{ width: '100%' }}
        onClick={() =>
          updateActiveCard(() => {
            const newAbilities = [...activeCard.abilities];
            newAbilities.push({
              name: `New ability ${newAbilities.length + 1}`,
              custom: true,
              showAbility: true,
              showDescription: false,
              type: 'Abilities',
              id: uuidv4(),
            });
            return { ...activeCard, abilities: newAbilities };
          })
        }
      >
        Add empty ability
      </Button>
    </>
  );
}
