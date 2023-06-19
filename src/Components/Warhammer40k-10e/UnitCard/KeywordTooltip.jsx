import { Tooltip } from "antd";

export const tooltipProps = {
  placement: "bottom",
  arrowPointAtCenter: true,
};

export const KeywordTooltip = ({ keyword }) => {
  if (keyword.includes("anti-")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={"An unmodified Wound roll of ‘x+’ against a target with the matching keyword scores a Critical Wound."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("one shot")) {
    return (
      <Tooltip {...tooltipProps} title={"The bearer can only shoot with this weapon once per battle."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("linked fire")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "When selecting targets for this weapon, you can measure range and determine visibility from another friendly Fire Prism model that is visible to the bearer."
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("plasma warhead")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "The bearer can only shoot with this weapon in your Shooting phase, and only if it Remained Stationary this turn and you did not use its Deathstrike Missile ability to Designate Target or Adjust Target this phase. When the bearer shoots with this weapon, do not select a target. Instead, resolve this weapon’s attacks, rolling for each unit within 6&quot; of the centre of its Deathstrike Target marker individually."
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("feel no pain")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "Each time this model would lose a wound, roll one D6: if the result equals or exceeds ‘x’, that wound is not lost."
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("anti-")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={"An unmodified Wound roll of ‘x+’ against a target with the matching keyword scores a Critical Wound."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("assault")) {
    return (
      <Tooltip {...tooltipProps} title={"Can be shot even if the bearer’s unit Advanced."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("pistol")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          <ul>
            <li>
              Can be shot even if the bearer’s unit is within Engagement Range of enemy units, but must target one of
              those enemy units.
            </li>
            <li>Cannot be shot alongside any other non-Pistol weapon (except by a Monster or Vehicle)</li>
          </ul>
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("melta")) {
    return (
      <Tooltip
        title={
          "Each time an attack made with this weapon targets a unit within half that weapon’s range, that attack’s Damage characteristic is increased by the amount denoted by ‘x’."
        }
        {...tooltipProps}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("rapid fire")) {
    return (
      <Tooltip title={"Increase the Attacks by ‘x’ when targeting units within half range."} {...tooltipProps}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("torrent")) {
    return (
      <Tooltip
        title={"Each time an attack is made with this weapon, that attack automatically hits the target."}
        {...tooltipProps}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("ignores cover")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "Each time an attack is made with this weapon, the target cannot have the Benefit of Cover against that attack"
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("lethal hits")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={"Each time an attack is made with this weapon, a Critical Hit automatically wounds the target."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("lance")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "Each time an attack is made with such a weapon, if the bearer made a Charge move this turn, add 1 to that attack’s Wound roll."
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("indirect fire")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          <ul>
            <li>Can target and make attacks against units that are not visible to the attacking unit.</li>
            <li>
              If no models are visible in a target unit when it is selected, then when making an attack against that
              target with an Indirect Fire weapon, subtract 1 from that attack’s Hit roll and the target has the Benefit
              of Cover against that attack.
            </li>
          </ul>
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("precision")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "When targeting an Attached unit, the attacking model’s player can have the attack allocated to a Character model in that unit visible to the bearer"
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("blast")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          <ul>
            <li>Add 1 to the Attacks characteristic for every five models in the target unit (rounding down).</li>
            <li>
              Can never be used against a target that is within Engagement Range of any units from the attacking model’s
              army (including its own).
            </li>
          </ul>
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("heavy")) {
    return (
      <Tooltip {...tooltipProps} title={"Add 1 to Hit rolls if the bearer’s unit Remained Stationary this turn."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("twin-linked")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={"Each time an attack is made with this weapon, you can re-roll that attack’s Wound roll."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("hazardous")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "After a unit shoots or fights, roll one Hazardous test (one D6) for each Hazardous weapon used. For each 1, one model equipped with a Hazardous weapon is destroyed (Characters, Monsters and Vehicles suffer 3 mortal wounds instead). "
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("devastating wounds")) {
    return (
      <Tooltip
        title={
          "A Critical Wound inflicts mortal wounds equal to the weapon’s Damage characteristic, instead of any normal damage."
        }
        {...tooltipProps}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("sustained hits")) {
    return (
      <Tooltip {...tooltipProps} title={"Each Critical Hit scores ‘x’ additional hits on the target."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("extra attacks")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={"The bearer can attack with this weapon in addition to any other weapons it can make attacks with."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("extra attacks")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={"The bearer can attack with this weapon in addition to any other weapons it can make attacks with."}>
        {`${keyword}`}
      </Tooltip>
    );
  }
  if (keyword.includes("psychic")) {
    return (
      <Tooltip
        {...tooltipProps}
        title={
          "If a Psychic weapon or ability causes any unit to suffer one or more wounds, each of those wounds is considered to have been inflicted by a Psychic Attack."
        }>
        {`${keyword}`}
      </Tooltip>
    );
  }
  return <span>{`${keyword}`}</span>;
};
