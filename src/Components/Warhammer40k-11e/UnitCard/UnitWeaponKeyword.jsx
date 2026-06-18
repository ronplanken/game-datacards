import { Button } from "antd";

// 11th edition weapon keywords are already-final plain strings. Render them with
// the same styling as 10e (keyword-button) but without the English-only tooltip
// dictionary.
export const UnitWeaponKeywords = ({ keywords }) => {
  return (
    <span className="keyword">
      {keywords?.map((keyword, index) => (
        <Button type="text" size="small" className="keyword-button" key={`${keyword}-${index}`}>
          {keyword}
        </Button>
      ))}
    </span>
  );
};
