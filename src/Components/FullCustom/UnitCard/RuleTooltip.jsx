import { Button, Tooltip } from "antd";

export const tooltipProps = {
  placement: "bottomRight",
  arrowPointAtCenter: true,
};

const CustomTooltip = ({ title, keyword }) => {
  return (
    <Tooltip {...tooltipProps} title={title}>
      <Button type="text" size="small" className="rule-button">{`${keyword}`}</Button>
    </Tooltip>
  );
};

export const RuleTooltip = ({ keyword }) => {
  if (keyword.includes("feel no pain")) {
    return (
      <CustomTooltip
        title={
          "Each time this model would lose a wound, roll one D6: if the result equals or exceeds ‘x’, that wound is not lost."
        }
        keyword={keyword}
      />
    );
  }
  if (keyword.includes("leader")) {
    return (
      <CustomTooltip
        title={
          "Before the battle, Character units with the Leader ability can be attached to one of their Bodyguard units to form an Attached unit"
        }
        keyword={keyword}
      />
    );
  }
  if (keyword.includes("deadly demise")) {
    return (
      <CustomTooltip
        title={'When this model is destroyed, roll one D6. On a 6, each unit within 6" suffers ‘x’ mortal wounds.'}
        keyword={keyword}
      />
    );
  }
  if (keyword.includes("deep strike")) {
    return (
      <CustomTooltip
        title={
          <ul>
            <li>Unit can be set up in Reserves instead of on the battlefield.</li>
            <li>
              Unit can be set up in your Reinforcements step, more than 9&quot; horizontally away from all enemy models.
            </li>
          </ul>
        }
        keyword={keyword}
      />
    );
  }
  if (keyword.includes("scouts")) {
    return (
      <CustomTooltip
        title={
          <ul>
            <li>Unit can make a Normal move of up to &apos;x&apos; before the first turn begins.</li>
            <li>If embarked in a Dedicated Transport, that Dedicated Transport can make this move instead.</li>
            <li>Must end this move more than 9&quot; horizontally away from all enemy models.</li>
          </ul>
        }
        keyword={keyword}
      />
    );
  }
  if (keyword.includes("fights first")) {
    return (
      <CustomTooltip
        title={
          "Units with this ability that are eligible to fight do so in the Fights First step, provided every model in the unit has this ability."
        }
        keyword={keyword}
      />
    );
  }
  if (keyword.includes("infiltrators")) {
    return (
      <CustomTooltip
        title={
          "During deployment, if every model in a unit has this ability, then when you set it up, it can be set up anywhere on the battlefield that is more than 9&quot horizontally away from the enemy deployment zone and all enemy models."
        }
        keyword={keyword}
      />
    );
  }
  if (keyword.includes("stealth")) {
    return (
      <CustomTooltip
        title={
          "If every model in a unit has this ability, then each time a ranged attack is made against it, subtract 1 from that attack’s Hit roll."
        }
        keyword={keyword}
      />
    );
  }
  if (keyword.includes("lone operative")) {
    return (
      <CustomTooltip
        title={
          "Unless part of an Attached unit, this unit can only be selected as the target of a ranged attack if the attacking model is within 12"
        }
        keyword={keyword}
      />
    );
  }
  return <span>{`${keyword}`}</span>;
};
