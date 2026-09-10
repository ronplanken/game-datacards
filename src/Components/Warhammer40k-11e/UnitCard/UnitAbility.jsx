import { MarkupText } from "./UnitAbilityDescription";

// `value` is an already-localised, comma-joined string (core/faction abilities).
export const UnitAbility = ({ name, value }) => {
  return (
    <>
      {value && (
        <div className="ability" data-name={name}>
          <span className="title">{name}</span>
          <span className="value">
            <MarkupText content={value} />
          </span>
        </div>
      )}
    </>
  );
};
