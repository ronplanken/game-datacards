import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1.2em" height="1.2em" viewBox="0 0 334 471" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-spell" fill="white">
      <rect width="334" height="470.423" rx="16" />
    </mask>
    <rect width="334" height="470.423" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-spell)" />
    {/* Crescent moon */}
    <path
      d="M220 235C220 297.5 169.5 348 107 348C96.5 348 86.4 346.5 77 343.8C100.6 369 134.2 385 172 385C241.7 385 298 328.7 298 259C298 197.3 259.8 144.6 205.8 127C214.8 145.5 220 166.5 220 189C220 205 217.5 220.4 212.8 234.7C216.2 234.9 219.5 235 220 235Z"
      fill="black"
      transform="translate(-30, -16) scale(0.9)"
    />
  </svg>
);

export const Spell = (props) => <Icon component={svgIcon} {...props} />;
