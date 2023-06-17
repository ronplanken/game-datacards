import { Tooltip } from "antd";

export const RuleTooltip = ({ keyword }) => {
  if (keyword.includes("feel no pain")) {
    return (
      <Tooltip
        placement="topRight"
        title={
          "Each time this model would lose a wound, roll one D6: if the result equals or exceeds ‘x’, that wound is not lost."
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("leader")) {
    return (
      <Tooltip
        placement="topRight"
        title={
          "Before the battle, Character units with the Leader ability can be attached to one of their Bodyguard units to form an Attached unit"
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("deadly demise")) {
    return (
      <Tooltip
        placement="topRight"
        title={'When this model is destroyed, roll one D6. On a 6, each unit within 6" suffers ‘x’ mortal wounds.'}>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("deep strike")) {
    return (
      <Tooltip
        placement="topRight"
        title={
          <ul>
            <li>Unit can be set up in Reserves instead of on the battlefield.</li>
            <li>
              Unit can be set up in your Reinforcements step, more than 9&quot; horizontally away from all enemy models.
            </li>
          </ul>
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("scouts")) {
    return (
      <Tooltip
        placement="topRight"
        title={
          <ul>
            <li>Unit can make a Normal move of up to &apos;x&apos; before the first turn begins.</li>
            <li>If embarked in a Dedicated Transport, that Dedicated Transport can make this move instead.</li>
            <li>Must end this move more than 9&quot; horizontally away from all enemy models.</li>
          </ul>
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("fights first")) {
    return (
      <Tooltip
        placement="topRight"
        title={
          "Units with this ability that are eligible to fight do so in the Fights First step, provided every model in the unit has this ability."
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("lone operative")) {
    return (
      <Tooltip
        placement="topRight"
        title={
          "Unless part of an Attached unit, this unit can only be selected as the target of a ranged attack if the attacking model is within 12"
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  return <span>{`${keyword}`}</span>;
};
