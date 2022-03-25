import { DeleteFilled } from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
} from 'antd';

const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

export const UnitCardEditor = ({ selectedCard, setSelectedCard }) => {
  const handleSheetChange = (event, index) => {
    setSelectedCard((current) => {
      const newDatasheets = [...current.datasheet];
      newDatasheets[index][event.target.name] = event.target.value;
      return { ...current, datasheet: newDatasheets };
    });
  };
  const handleProfileChange = (event, index, pindex) => {
    setSelectedCard((current) => {
      const newWargear = [...current.wargear];
      newWargear[index].profiles[pindex][event.target.name] = event.target.value;
      return { ...current, wargear: newWargear };
    });
  };

  const renderProfile = (wargear, index) => {
    if (!wargear.active) {
      return null;
    }
    let wargearName;
    if (wargear.profiles.length > 1) {
      wargearName = (
        <Form.Item label={'Name'}>
          <Input type={'text'} value={wargear.name} />
        </Form.Item>
      );
    }
    const profiles = (
      <>
        {wargear.profiles.map((profile, pindex) => {
          return (
            <div className='weapon' key={`profile-${profile.wargear_id}-${index}-${pindex}`}>
              <div className='weapon_edit_profile'>
                <div className='left' id='value' style={{ whiteSpace: 'nowrap' }}>
                  <Input
                    type='text'
                    value={profile.name}
                    name='name'
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className='center' id='value' style={{ whiteSpace: 'nowrap' }}>
                  <Input
                    type='text'
                    value={profile.Range}
                    name='Range'
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className='center' id='value' style={{ whiteSpace: 'nowrap' }}>
                  <Input
                    type='text'
                    value={profile.type}
                    name='type'
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className='center' id='value'>
                  <Input
                    type='text'
                    value={profile.S}
                    name='S'
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className='center' id='value'>
                  <Input
                    type='text'
                    value={profile.AP}
                    name='AP'
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className='center' id='value'>
                  <Input
                    type='text'
                    value={profile.D}
                    name='D'
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
              </div>
              <TextArea
                type='text'
                value={profile.abilities}
                name='abilities'
                onChange={(e) => handleProfileChange(e, index, pindex)}
              />
            </div>
          );
        })}
      </>
    );

    return (
      <>
        {wargearName}
        <div className='weapon_edit_profile edit_heading' key={`profile-header-${index}`}>
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
        {profiles}
      </>
    );
  };

  return (
    <Collapse defaultActiveKey={['1']}>
      <Panel header='Basic information' style={{ width: '100%' }} key='1'>
        <Form.Item label={'Name'}>
          <Input
            type={'text'}
            value={selectedCard.name}
            onChange={(e) =>
              setSelectedCard((current) => {
                return { ...current, name: e.target.value };
              })
            }
          />
        </Form.Item>
        <Form.Item label={'Type'}>
          <Select
            value={selectedCard.role}
            onChange={(value) =>
              setSelectedCard((current) => {
                return { ...current, role: value };
              })
            }
          >
            <Option value='HQ'>HQ</Option>
            <Option value='Elites'>Elites</Option>
            <Option value='Heavy Support'>Heavy Support</Option>
            <Option value='Fast Attack'>Fast Attack</Option>
            <Option value='Dedicated Transport'>Dedicated Transport</Option>
            <Option value='Flyers'>Flyers</Option>
            <Option value='Fortifications'>Fortifications</Option>
            <Option value='Lords of War'>Lords of War</Option>
            <Option value='Unknown'>Unknown</Option>
          </Select>
        </Form.Item>
      </Panel>
      <Panel header='Datasheets' key='2'>
        {selectedCard.datasheet.map((sheet, index) => {
          return (
            <Card
              key={`sheet-${sheet.datasheet_id}-${index}`}
              title={sheet.name}
              bodyStyle={{ padding: 0 }}
              style={{ marginBottom: '16px' }}
              extra={
                <Space>
                  {sheet.custom && (
                    <Popconfirm
                      title={'Are you sure you want to delete this datasheet?'}
                      onConfirm={(value) =>
                        setSelectedCard((current) => {
                          const newDatasheets = [...current.datasheet];
                          newDatasheets.splice(index, 1);
                          return { ...current, datasheet: newDatasheets };
                        })
                      }
                    >
                      <Button type='icon' shape='circle' icon={<DeleteFilled />}></Button>
                    </Popconfirm>
                  )}
                  <Switch
                    checked={sheet.active}
                    onChange={(value) =>
                      setSelectedCard((current) => {
                        const newDatasheets = [...current.datasheet];
                        newDatasheets[index]['active'] = value;
                        return { ...current, datasheet: newDatasheets };
                      })
                    }
                  />
                </Space>
              }
            >
              {sheet.active && (
                <>
                  <div className='labels edit_heading'>
                    <div className='center label'>
                      <div className='movement' id='icon' title='Movement' alt-text='Movement'></div>
                    </div>
                    <div className='center label'>
                      <div className='weaponskill' id='icon' title='Weapon Skill' alt-text='Weapon Skill'></div>
                    </div>
                    <div className='center label'>
                      <div
                        className='ballisticskill'
                        id='icon'
                        title='Ballistic Skill'
                        alt-text='Ballistic Skill'
                      ></div>
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
                  <div className='labels edit_line'>
                    <div className='center label'>
                      <Input type='text' value={sheet.M} name='M' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                    <div className='center label'>
                      <Input type='text' value={sheet.WS} name='WS' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                    <div className='center label'>
                      <Input type='text' value={sheet.BS} name='BS' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                    <div className='center label'>
                      <Input type='text' value={sheet.S} name='S' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                    <div className='center label'>
                      <Input type='text' value={sheet.T} name='T' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                    <div className='center label'>
                      <Input type='text' value={sheet.W} name='W' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                    <div className='center label'>
                      <Input type='text' value={sheet.A} name='A' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                    <div className='center label'>
                      <Input type='text' value={sheet.Ld} name='Ld' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                    <div className='center label'>
                      <Input type='text' value={sheet.Sv} name='Sv' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                    <div className='center label'>
                      <Input type='text' value={sheet.Inv} name='Inv' onChange={(e) => handleSheetChange(e, index)} />
                    </div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
        <Button
          type='dashed'
          style={{ width: '100%' }}
          onClick={() =>
            setSelectedCard((current) => {
              const newDatasheets = [...current.datasheet];
              newDatasheets.push({
                name: `New sheet ${newDatasheets.length + 1}`,
                custom: true,
                active: true,
                id: `custom${newDatasheets.length + 1}`,
              });
              console.log(newDatasheets);
              return { ...current, datasheet: newDatasheets };
            })
          }
        >
          Add empty datasheet
        </Button>
      </Panel>
      <Panel header='Unit composition' key='3'>
        <TextArea
          onChange={(e) =>
            setSelectedCard((current) => {
              return { ...current, unit_composition: e.target.value };
            })
          }
          value={selectedCard.unit_composition}
        />
      </Panel>
      <Panel header='Weapon profiles' key='4'>
        {selectedCard.wargear.map((wargear, index) => {
          return (
            <Card
              key={`wargear-${wargear.id}`}
              title={wargear.name}
              bodyStyle={{ padding: 0 }}
              style={{ marginBottom: '16px' }}
              extra={
                <Switch
                  checked={wargear.active}
                  onChange={(value) =>
                    setSelectedCard((current) => {
                      const newWargear = [...current.wargear];
                      newWargear[index]['active'] = value;
                      return { ...current, wargear: newWargear };
                    })
                  }
                />
              }
            >
              {renderProfile(wargear, index)}
            </Card>
          );
        })}
      </Panel>
      <Panel header='Abilities' key='5'>
        {selectedCard.abilities.map((ability, index) => {
          return (
            <Card
              key={`ability-${ability.id}-${index}`}
              title={ability.name}
              bodyStyle={{ padding: 0 }}
              style={{ marginBottom: '16px' }}
              extra={
                <Switch
                  checked={ability.showAbility}
                  onChange={(value) => {
                    setSelectedCard((current) => {
                      const newAbilities = [...current.abilities];
                      newAbilities[index]['showAbility'] = value;
                      return { ...current, abilities: newAbilities };
                    });
                  }}
                />
              }
            >
              {ability.showAbility && (
                <Row justify='space-between' align='middle'>
                  <Col span={2} justify='center'>
                    <Switch
                      checked={ability.showDescription}
                      onChange={(value) => {
                        setSelectedCard((current) => {
                          const newAbilities = [...current.abilities];
                          newAbilities[index]['showDescription'] = value;
                          return { ...current, abilities: newAbilities };
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
                        setSelectedCard((current) => {
                          const newAbilities = [...current.abilities];
                          newAbilities[index]['description'] = e.target.value;
                          return { ...current, abilities: newAbilities };
                        });
                      }}
                    />
                  </Col>
                </Row>
              )}
            </Card>
          );
        })}
      </Panel>
      <Panel header='Keywords' key='6'>
        {selectedCard.keywords.map((keyword, index) => {
          return (
            <Row justify='space-between' align='middle' key={`ability-${keyword.keyword}-${index}`}>
              <Col span={22} justify='center'>
                <Checkbox
                  checked={keyword.active}
                  onChange={(e) => {
                    setSelectedCard((current) => {
                      const newKeywords = [...current.keywords];
                      newKeywords[index]['active'] = e.target.checked;
                      return { ...current, keywords: newKeywords };
                    });
                  }}
                >
                  {keyword.keyword}
                </Checkbox>
              </Col>
            </Row>
          );
        })}
      </Panel>
    </Collapse>
  );
};
