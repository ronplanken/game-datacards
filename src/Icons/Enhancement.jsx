import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_1004_13" fill="white">
      <rect width="334" height="470.423" rx="16" />
    </mask>
    <rect width="334" height="470.423" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-1_1004_13)" />
    <path
      d="M268 235.5C228.349 259.835 189.118 308.604 167 365C144.882 308.604 105.656 259.835 66 235.5C105.651 211.165 144.882 162.396 167 106C189.118 162.396 228.344 211.165 268 235.5Z"
      fill="black"
    />
  </svg>
);

export const Enhancement = (props) => <Icon component={svgIcon} {...props} />;
