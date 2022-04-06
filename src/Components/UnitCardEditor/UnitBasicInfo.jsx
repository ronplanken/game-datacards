import { Form, Input, Select } from 'antd';
import React from 'react';
import { useCardStorage } from '../../Hooks/useCardStorage';

const { Option } = Select;

export function UnitBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Form.Item label={'Name'}>
          <Input
            type={'text'}
            value={activeCard.name}
            onChange={(e) => updateActiveCard({ ...activeCard, name: e.target.value })}
          />
        </Form.Item>
        <Form.Item label={'Type'}>
          <Select value={activeCard.role} onChange={(value) => updateActiveCard({ ...activeCard, role: value })}>
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
    </>
  );
}
