import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_105_9" fill="white">
      <rect width="334" height="470.423" rx="16" />
    </mask>
    <rect width="334" height="470.423" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-1_105_9)" />
    <line x1="287" y1="131" x2="47" y2="131" stroke="black" strokeWidth="32" />
    <line x1="47" y1="339" x2="287" y2="339" stroke="black" strokeWidth="32" />
  </svg>
);

export const Stratagem = (props) => <Icon component={svgIcon} {...props} />;
