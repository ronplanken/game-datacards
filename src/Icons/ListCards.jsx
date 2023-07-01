import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 350 466" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M287.288 410.658V434C287.288 442.837 280.125 450 271.288 450H32.1018C23.2652 450 16.1018 442.837 16.1018 434L16.1018 83.7966C16.1018 74.9601 23.2653 67.7966 32.1018 67.7966H55.0747"
      stroke="currentColor"
      strokeWidth="32"
    />
    <mask id="path-2-inside-1_707_2" fill="white">
      <rect x="66.9492" width="283.051" height="398.663" rx="16" />
    </mask>
    <rect
      x="66.9492"
      width="283.051"
      height="398.663"
      rx="16"
      stroke="currentColor"
      strokeWidth="64"
      mask="url(#path-2-inside-1_707_2)"
    />
  </svg>
);

export const ListCards = (props) => <Icon component={svgIcon} {...props} />;
