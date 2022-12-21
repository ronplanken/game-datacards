import { DeleteFilled } from "@ant-design/icons";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button, Card, Input, Popconfirm, Space, Switch, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function UnitWeapons() {
  const { activeCard, updateActiveCard } = useCardStorage();

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const handleProfileChange = (event, index, pindex) => {
    const newWargear = [...activeCard.wargear];
    newWargear[index].profiles[pindex][event.target.name] = event.target.value;
    updateActiveCard({ ...activeCard, wargear: newWargear });
  };

  const renderProfile = (wargear, index) => {
    if (!wargear.active) {
      return null;
    }
    const profiles = (
      <>
        {wargear.profiles.map((profile, pindex) => {
          return (
            <div className="weapon" key={`profile-${profile.wargear_id}-${index}-${pindex}`}>
              <div className="weapon_edit_profile">
                <div className="left value" style={{ whiteSpace: "nowrap" }}>
                  <Input
                    type="text"
                    value={profile.name}
                    name="name"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value" style={{ whiteSpace: "nowrap" }}>
                  <Input
                    type="text"
                    value={profile.Range}
                    name="Range"
                    onChange={(e) => handleProfileChange(e, index, pindex)}
                  />
                </div>
                <div className="center value" style={{ whiteSpace: "nowrap" }}>
                  <Input
                    type="text"
                    value={profile.type}
                    name="type"
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
                  <Popconfirm
                    title={"Are you sure you want to delete this weapon profile?"}
                    placement="topRight"
                    onConfirm={(value) => {
                      const newWargear = [...activeCard.wargear];
                      newWargear[index].profiles.splice(pindex, 1);
                      updateActiveCard({ ...activeCard, wargear: newWargear });
                    }}>
                    <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                  </Popconfirm>
                </div>
              </div>
              <MDEditor
                preview="edit"
                commands={[
                  commands.bold,
                  commands.italic,
                  commands.strikethrough,
                  commands.hr,
                  commands.divider,
                  commands.unorderedListCommand,
                  commands.orderedListCommand,
                  commands.divider,
                ]}
                extraCommands={[]}
                value={profile.abilities}
                height={100}
                onChange={(value) => {
                  updateActiveCard(() => {
                    const newWargear = [...activeCard.wargear];
                    newWargear[index].profiles[pindex]["abilities"] = value;
                    return { ...activeCard, wargear: newWargear };
                  });
                }}
              />
            </div>
          );
        })}
      </>
    );

    return (
      <>
        <div className="weapon_edit_profile edit_heading" key={`profile-header-${index}`}>
          <div className="left label">DESCRIPTION</div>
          <div className="center label">
            <div className="range icon" title="Range" alt-text="Range"></div>
          </div>
          <div className="center label">
            <div className="type icon" title="Type" alt-text="Type"></div>
          </div>
          <div className="center label">
            <div className="strength icon" title="Type" alt-text="Type"></div>
          </div>
          <div className="center label">
            <div className="ap icon" title="Type" alt-text="Type"></div>
          </div>
          <div className="center label">
            <div className="dmg icon" title="Type" alt-text="Type"></div>
          </div>
        </div>
        {profiles}
        <Button
          type="dashed"
          style={{ width: "100%", marginTop: "4px" }}
          size={"small"}
          onClick={() => {
            const newWargear = [...activeCard.wargear];
            newWargear[index].profiles.push({
              name: `New Profile ${newWargear[index].profiles.length + 1}`,
              custom: true,
              active: true,
              id: uuidv4(),
              wargear_id: newWargear[index].id,
              line: newWargear[index].profiles.length + 1,
              profiles: [],
            });
            updateActiveCard({ ...activeCard, wargear: newWargear });
          }}>
          Add empty profile
        </Button>
      </>
    );
  };

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newWargear = reorder(activeCard.wargear, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, wargear: newWargear });
        }}>
        <Droppable droppableId="droppable-abilities">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.wargear.map((wargear, index) => {
                  return (
                    <Draggable
                      key={`ability-${wargear.id}-${index}`}
                      draggableId={`ability-${wargear.id}-${index}`}
                      index={index}>
                      {(drag) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}>
                          <Card
                            key={`wargear-${wargear.id}`}
                            type={"inner"}
                            size={"small"}
                            title={
                              <Typography.Text
                                editable={{
                                  onChange: (value) => {
                                    const newWargear = [...activeCard.wargear];
                                    newWargear[index]["name"] = value;
                                    updateActiveCard({ ...activeCard, wargear: newWargear });
                                  },
                                }}>
                                {wargear.name}
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
                                      const newWargear = [...activeCard.wargear];
                                      newWargear.splice(index, 1);
                                      return { ...activeCard, wargear: newWargear };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                                </Popconfirm>
                                <Switch
                                  checked={wargear.active}
                                  onChange={(value) =>
                                    updateActiveCard(() => {
                                      const newWargear = [...activeCard.wargear];
                                      newWargear[index]["active"] = value;
                                      return { ...activeCard, wargear: newWargear };
                                    })
                                  }
                                />
                              </Space>
                            }>
                            {renderProfile(wargear, index)}
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
      <Button
        type="dashed"
        style={{ width: "100%" }}
        onClick={() =>
          updateActiveCard(() => {
            const newWargear = [...activeCard.wargear];
            newWargear.push({
              name: `New weapon ${newWargear.length + 1}`,
              custom: true,
              active: true,
              id: uuidv4(),
              profiles: [],
            });
            return { ...activeCard, wargear: newWargear };
          })
        }>
        Add empty weapon
      </Button>
    </>
  );
}
