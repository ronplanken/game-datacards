import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 471 334" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_701_2" fill="white">
      <rect width="470.42" height="334" rx="16" />
    </mask>
    <rect width="470.42" height="334" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-1_701_2)" />
    <line x1="254" y1="82" x2="62" y2="82" stroke="black" strokeWidth="32" />
  </svg>
);

export const Datacard10e = (props) => <Icon component={svgIcon} {...props} />;
