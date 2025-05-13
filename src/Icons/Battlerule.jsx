import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_1004_19" fill="white">
      <rect width="334" height="470.423" rx="16" />
    </mask>
    <rect width="334" height="470.423" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-1_1004_19)" />
    <path
      d="M199.65 77C27.3634 77 -11.493 333.015 158.606 333.015C215.412 333.015 215.853 247.574 158.606 247.574C66.47 247.574 93.3397 113.578 199.65 77ZM179.281 137.985C122.476 137.985 122.034 223.426 179.281 223.426C271.419 223.426 237.45 357.422 131.139 394C303.425 394 349.379 137.985 179.281 137.985Z"
      fill="black"
    />
  </svg>
);

export const Battlerule = (props) => <Icon component={svgIcon} {...props} />;
