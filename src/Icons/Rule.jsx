import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-rule" fill="white">
      <rect width="334" height="470.423" rx="16" />
    </mask>
    <rect width="334" height="470.423" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-rule)" />
    {/* Paragraph lines representing rules text */}
    <line x1="70" y1="140" x2="264" y2="140" stroke="black" strokeWidth="24" strokeLinecap="round" />
    <line x1="70" y1="200" x2="264" y2="200" stroke="black" strokeWidth="24" strokeLinecap="round" />
    <line x1="70" y1="260" x2="200" y2="260" stroke="black" strokeWidth="24" strokeLinecap="round" />
    <line x1="70" y1="320" x2="264" y2="320" stroke="black" strokeWidth="24" strokeLinecap="round" />
  </svg>
);

export const Rule = (props) => <Icon component={svgIcon} {...props} />;
