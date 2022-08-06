import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 471 334" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_106_22" fill="white">
      <rect width="470.42" height="334" rx="16" />
    </mask>
    <rect width="470.42" height="334" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-1_106_22)" />
    <circle cx="357.711" cy="113.289" r="52.5" fill="black" />
    <circle cx="68" cy="266" r="20" fill="black" />
    <circle cx="124" cy="266" r="20" fill="black" />
    <circle cx="180" cy="266" r="20" fill="black" />
  </svg>
);

export const Vehicle = (props) => <Icon component={svgIcon} {...props} />;
