import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-warscroll" fill="white">
      <rect width="334" height="470.423" rx="16" />
    </mask>
    <rect width="334" height="470.423" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-warscroll)" />
    {/* Banner pole */}
    <rect x="100" y="90" width="16" height="290" fill="black" />
    {/* Banner flag with wave effect */}
    <path
      d="M116 90 L116 230 Q145 215, 175 230 Q205 245, 235 230 L235 90 Q205 105, 175 90 Q145 75, 116 90 Z"
      fill="black"
    />
    {/* Pole top ornament */}
    <circle cx="108" cy="82" r="18" fill="black" />
  </svg>
);

export const Warscroll = (props) => <Icon component={svgIcon} {...props} />;
