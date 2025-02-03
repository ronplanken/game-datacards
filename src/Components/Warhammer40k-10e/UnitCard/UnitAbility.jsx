import { replaceKeywords } from "./UnitAbilityDescription";

export const UnitAbility = ({ name, value }) => {
  return (
    <>
      {value && (
        <div className="ability" data-name={name}>
          <span className="title">{name}</span>
          <span className="value">{replaceKeywords(value)}</span>
        </div>
      )}
    </>
  );
};
