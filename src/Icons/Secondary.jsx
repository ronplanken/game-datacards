import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_105_14" fill="white">
      <rect width="334" height="470.423" rx="16" />
    </mask>
    <rect width="334" height="470.423" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-1_105_14)" />
    <path
      d="M167 121L192.595 199.772H275.42L208.413 248.456L234.008 327.228L167 278.544L99.9925 327.228L125.587 248.456L58.5796 199.772H141.405L167 121Z"
      fill="black"
    />
  </svg>
);

export const Secondary = (props) => <Icon component={svgIcon} {...props} />;
