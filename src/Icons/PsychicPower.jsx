import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em"  viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_202_2" fill="white">
      <rect width="334" height="470.423" rx="16" />
    </mask>
    <rect width="334" height="470.423" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-1_202_2)" />
    <path d="M166.761 67V271.521H274.522L166.761 67Z" fill="black" />
    <path d="M59 199.669L166.761 404.19V199.669H59Z" fill="black" />
  </svg>
);

export const PsychicPower = (props) => <Icon component={svgIcon} {...props} />;
