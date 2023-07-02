import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M318 455V24C318 19.5817 314.419 16 310 16L24.0002 16C19.582 16 16.0002 19.5817 16.0002 24L16.0002 354.894M318 455H114.809M318 455H115.809M318 455H116.809"
      stroke="currentColor"
      strokeWidth="32"
    />
    <line x1="12.6865" y1="451.686" x2="112.389" y2="351.984" stroke="currentColor" strokeWidth="32" />
    <circle cx="168.5" cy="302.5" r="88.5" stroke="currentColor" strokeWidth="32" />
  </svg>
);

export const ViewCards = (props) => <Icon component={svgIcon} {...props} />;
