import { DeleteFilled } from "@ant-design/icons";
import { Button, Card, Input, Popconfirm, Space, Switch, Typography } from "antd";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { GangerWeaponTraits } from "./GangerWeaponTraits";

export function GangerWeapons() {
  const { activeCard, updateActiveCard } = useCardStorage();

  const handleProfileChange = (event, index, pindex) => {
    const newWeapons = [...activeCard.weapons];
    newWeapons[index].profiles[pindex][event.target.name] = event.target.value;
    updateActiveCard({ ...activeCard, weapons: newWeapons });
  };

  const renderProfile = (weapon, index) => {
    if (!weapon.active) {
      return null;
    }
    const profiles = (
      <>
        {weapon.profiles.map((profile, pindex) => {
          return (
            <div className="weapon" key={`profile-${profile.id}-${index}-${pindex}`}>
              <div className="ganger_weapon_profile">
                <div className="left value" style={{ whiteSpace: "nowrap" }}>
                  <Input
                    type="text"
                    value={profile.name}
                    name="name"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value">
                  <Input
                    type="text"
                    value={profile.S}
                    name="S"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value">
                  <Input
                    type="text"
                    value={profile.L}
                    name="L"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value">
                  <Input
                    type="text"
                    value={profile.S2}
                    name="S2"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value">
                  <Input
                    type="text"
                    value={profile.L2}
                    name="L2"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value">
                  <Input
                    type="text"
                    value={profile.STR}
                    name="STR"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value">
                  <Input
                    type="text"
                    value={profile.AP}
                    name="AP"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value">
                  <Input
                    type="text"
                    value={profile.D}
                    name="D"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value">
                  <Input
                    type="text"
                    value={profile.AM}
                    name="AM"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value">
                  <Popconfirm
                    title={"Are you sure you want to delete this weapon profile?"}
                    placement="topRight"
                    onConfirm={(value) => {
                      const newWeapons = [...activeCard.weapons];
                      newWeapons[index].profiles.splice(pindex, 1);
                      updateActiveCard({ ...activeCard, weapons: newWeapons });
                    }}>
                    <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                  </Popconfirm>
                </div>
              </div>
              <GangerWeaponTraits weaponIndex={index} profileIndex={pindex} />
            </div>
          );
        })}
      </>
    );

    return (
      <>
        <div className="ganger_weapon_profile edit_heading" key={`profile-header-${index}`}>
          <div className="left label">WEAPON</div>
          <div className="center label">S</div>
          <div className="center label">L</div>
          <div className="center label">S</div>
          <div className="center label">L</div>
          <div className="center label">STR</div>
          <div className="center label">AP</div>
          <div className="center label">D</div>
          <div className="center label">AM</div>
          <div className="center label"></div>
        </div>
        {profiles}
        <Button
          type="dashed"
          style={{ width: "100%", marginTop: "4px" }}
          size={"small"}
          onClick={() => {
            const newWeapon = [...activeCard.weapons];
            newWeapon[index].profiles.push({
              name: `New Profile ${newWeapon[index].profiles.length + 1}`,
              custom: true,
              active: true,
              id: uuidv4(),
              line: newWeapon[index].profiles.length + 1,
            });
            updateActiveCard({ ...activeCard, weapons: newWeapon });
          }}>
          Add empty profile
        </Button>
      </>
    );
  };

  return (
    <>
      {activeCard.weapons.map((weapon, index) => {
        return (
          <Card
            key={`weapon-${weapon.id}`}
            type={"inner"}
            size={"small"}
            title={
              <Typography.Text
                editable={{
                  onChange: (value) => {
                    const newWeapon = [...activeCard.weapons];
                    newWeapon[index]["name"] = value;
                    updateActiveCard({ ...activeCard, weapons: newWeapon });
                  },
                }}>
                {weapon.name}
              </Typography.Text>
            }
            bodyStyle={{ padding: 0 }}
            style={{ marginBottom: "16px" }}
            extra={
              <Space>
                <Popconfirm
                  title={"Are you sure you want to delete this weapon?"}
                  placement="topRight"
                  onConfirm={(value) =>
                    updateActiveCard(() => {
                      const newWeapons = [...activeCard.weapons];
                      newWeapons.splice(index, 1);
                      return { ...activeCard, weapons: newWeapons };
                    })
                  }>
                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                </Popconfirm>
                <Switch
                  checked={weapon.active}
                  onChange={(value) =>
                    updateActiveCard(() => {
                      const newWeapons = [...activeCard.weapons];
                      newWeapons[index]["active"] = value;
                      return { ...activeCard, weapons: newWeapons };
                    })
                  }
                />
              </Space>
            }>
            {renderProfile(weapon, index)}
          </Card>
        );
      })}
      <Button
        type="dashed"
        style={{ width: "100%" }}
        onClick={() =>
          updateActiveCard(() => {
            const newWeapon = [...activeCard.weapons];
            newWeapon.push({
              name: `New weapon ${newWeapon.length + 1}`,
              custom: true,
              active: true,
              id: uuidv4(),
              profiles: [],
            });
            return { ...activeCard, weapons: newWeapon };
          })
        }>
        Add empty weapon
      </Button>
    </>
  );
}
