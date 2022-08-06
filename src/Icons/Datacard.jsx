import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_105_11" fill="white">
      <rect width="334" height="470.423" rx="16" />
    </mask>
    <rect width="334" height="470.423" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-1_105_11)" />
    <line x1="141.813" y1="104.292" x2="66.8132" y2="104.292" stroke="black" strokeWidth="75" />
  </svg>
);

export const Datacard = (props) => <Icon component={svgIcon} {...props} />;
