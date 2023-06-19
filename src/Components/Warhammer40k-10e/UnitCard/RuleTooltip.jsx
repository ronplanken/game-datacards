import { Tooltip } from "antd";

export const tooltipProps = {
  placement: "bottomRight",
  arrowPointAtCenter: true,
};

export const RuleTooltip = ({ keyword }) => {
  if (keyword.includes("feel no pain")) {
    return (
      <Tooltip
        {...tooltipProps}
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
        {...tooltipProps}
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
        {...tooltipProps}
        title={'When this model is destroyed, roll one D6. On a 6, each unit within 6" suffers ‘x’ mortal wounds.'}>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("deep strike")) {
    return (
      <Tooltip
        {...tooltipProps}
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
        {...tooltipProps}
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
        {...tooltipProps}
        title={
          "Units with this ability that are eligible to fight do so in the Fights First step, provided every model in the unit has this ability."
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("infiltrators")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "During deployment, if every model in a unit has this ability, then when you set it up, it can be set up anywhere on the battlefield that is more than 9&quot horizontally away from the enemy deployment zone and all enemy models."
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("stealth")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "If every model in a unit has this ability, then each time a ranged attack is made against it, subtract 1 from that attack’s Hit roll."
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("lone operative")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "Unless part of an Attached unit, this unit can only be selected as the target of a ranged attack if the attacking model is within 12"
        }>
        {` ${keyword}`}
      </Tooltip>
    );
  }
  return <span>{`${keyword}`}</span>;
};
