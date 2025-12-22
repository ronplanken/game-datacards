import { Button } from "antd";
import { Tooltip } from "../../Tooltip/Tooltip";

export const tooltipProps = {
  placement: "bottom-start",
};

export const KeywordTooltip = ({ keyword }) => {
  if (keyword.toLowerCase().includes("anti-")) {
    return (
      <Tooltip
        {...tooltipProps}
        content="An unmodified Wound roll of 'x+' against a target with the matching keyword scores a Critical Wound.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("one shot")) {
    return (
      <Tooltip {...tooltipProps} content="The bearer can only shoot with this weapon once per battle.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("linked fire")) {
    return (
      <Tooltip
        {...tooltipProps}
        content="When selecting targets for this weapon, you can measure range and determine visibility from another friendly Fire Prism model that is visible to the bearer.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("plasma warhead")) {
    return (
      <Tooltip
        {...tooltipProps}
        content={
          "The bearer can only shoot with this weapon in your Shooting phase, and only if it Remained Stationary this turn and you did not use its Deathstrike Missile ability to Designate Target or Adjust Target this phase. When the bearer shoots with this weapon, do not select a target. Instead, resolve this weapon's attacks, rolling for each unit within 6\" of the centre of its Deathstrike Target marker individually."
        }>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("feel no pain")) {
    return (
      <Tooltip
        {...tooltipProps}
        content="Each time this model would lose a wound, roll one D6: if the result equals or exceeds 'x', that wound is not lost.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("assault")) {
    return (
      <Tooltip {...tooltipProps} content="Can be shot even if the bearer's unit Advanced.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("pistol")) {
    return (
      <Tooltip
        {...tooltipProps}
        content={
          <ul>
            <li>
              Can be shot even if the bearer&apos;s unit is within Engagement Range of enemy units, but must target one
              of those enemy units.
            </li>
            <li>Cannot be shot alongside any other non-Pistol weapon (except by a Monster or Vehicle)</li>
          </ul>
        }>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("melta")) {
    return (
      <Tooltip
        content="Each time an attack made with this weapon targets a unit within half that weapon's range, that attack's Damage characteristic is increased by the amount denoted by 'x'."
        {...tooltipProps}>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("rapid fire")) {
    return (
      <Tooltip content="Increase the Attacks by 'x' when targeting units within half range." {...tooltipProps}>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("torrent")) {
    return (
      <Tooltip
        content="Each time an attack is made with this weapon, that attack automatically hits the target."
        {...tooltipProps}>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("ignores cover")) {
    return (
      <Tooltip
        {...tooltipProps}
        content="Each time an attack is made with this weapon, the target cannot have the Benefit of Cover against that attack">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("lethal hits")) {
    return (
      <Tooltip
        {...tooltipProps}
        content="Each time an attack is made with this weapon, a Critical Hit automatically wounds the target.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("lance")) {
    return (
      <Tooltip
        {...tooltipProps}
        content="Each time an attack is made with such a weapon, if the bearer made a Charge move this turn, add 1 to that attack's Wound roll.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("indirect fire")) {
    return (
      <Tooltip
        {...tooltipProps}
        content={
          <ul>
            <li>Can target and make attacks against units that are not visible to the attacking unit.</li>
            <li>
              If no models are visible in a target unit when it is selected, then when making an attack against that
              target with an Indirect Fire weapon, subtract 1 from that attack&apos;s Hit roll, an unmodified Hit roll
              of 1-3 always fails, and the target has the Benefit of Cover against that attack.
            </li>
          </ul>
        }>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("precision")) {
    return (
      <Tooltip
        {...tooltipProps}
        content="When targeting an Attached unit, the attacking model's player can have the attack allocated to a Character model in that unit visible to the bearer">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("blast")) {
    return (
      <Tooltip
        {...tooltipProps}
        content={
          <ul>
            <li>Add 1 to the Attacks characteristic for every five models in the target unit (rounding down).</li>
            <li>
              Can never be used against a target that is within Engagement Range of any units from the attacking
              model&apos;s army (including its own).
            </li>
          </ul>
        }>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("heavy")) {
    return (
      <Tooltip {...tooltipProps} content="Add 1 to Hit rolls if the bearer's unit Remained Stationary this turn.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("twin-linked")) {
    return (
      <Tooltip
        {...tooltipProps}
        content="Each time an attack is made with this weapon, you can re-roll that attack's Wound roll.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("hazardous")) {
    return (
      <Tooltip
        {...tooltipProps}
        content={
          <>
            <p>
              Each time a unit is selected to shoot or fight, after that unit has resolved all of its attacks, for each
              Hazardous weapon that targets were selected for when resolving those attacks, that unit must take one
              Hazardous test. To do so, roll one D6: on a 1, that test is failed. For each failed test you must resolve
              the following sequence (resolve each failed test one at a time).
            </p>
            <ul>
              <li>
                If possible, select one model in that unit that has lost one or more wounds and is equipped with one or
                more Hazardous weapons.
              </li>
              <li>
                Otherwise, if possible, select one model in that unit (excluding Character models) equipped with one or
                more Hazardous weapons.
              </li>
              <li>Otherwise, select one Character model in that unit equipped with one or more Hazardous weapons.</li>
            </ul>
            <p>
              If a model was selected, that unit suffers 3 mortal wounds and when allocating those mortal wounds, they
              must be allocated to the selected model.
            </p>
            <p>
              If a unit from a player&apos;s army is selected as the target of the Fire Overwatch Stratagem in their
              opponent&apos;s Charge phase, any mortal wounds inflicted by Hazardous tests are allocated after the
              charging unit has ended its Charge move.
            </p>
          </>
        }>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("devastating wounds")) {
    return (
      <Tooltip
        {...tooltipProps}
        content={
          <p>
            Each time an attack is made with such a weapon, if that attack scores a Critical Wound, no saving throw of
            any kind can be made against that attack (including invulnerable saving throws). Such attacks are only
            allocated to models after all other attacks made by the attacking unit have been allocated and resolved.
            After that attack is allocated and after any modifiers are applied, it inflicts a number of mortal wounds on
            the target equal to the Damage characteristic of that attack, instead of inflicting damage normally.
          </p>
        }>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("sustained hits")) {
    return (
      <Tooltip {...tooltipProps} content="Each Critical Hit scores 'x' additional hits on the target.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("extra attacks")) {
    return (
      <Tooltip
        {...tooltipProps}
        content={
          <p>
            Each time the bearer of one or more Extra Attacks weapons fights, it makes attacks with each of the Extra
            Attacks melee weapons it is equipped with and it makes attacks with one of the melee weapons it is equipped
            with that does not have the [EXTRA ATTACKS] ability (if any). The number of attacks made with an Extra
            Attacks weapon cannot be modified by other rules, unless that weapon&apos;s name is explicitly specified in
            that rule.
          </p>
        }>
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  if (keyword.toLowerCase().includes("psychic")) {
    return (
      <Tooltip
        {...tooltipProps}
        content="If a Psychic weapon or ability causes any unit to suffer one or more wounds, each of those wounds is considered to have been inflicted by a Psychic Attack.">
        <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
      </Tooltip>
    );
  }
  return (
    <span>
      <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
    </span>
  );
};
