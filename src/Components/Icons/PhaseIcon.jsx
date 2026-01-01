// Phase icons for Warhammer 40k 10th edition stratagems
// Inline SVGs to fix MacOS print-to-PDF rendering issues
/* eslint-disable max-len */

const AnySvg = ({ fill = "currentColor", ...props }) => (
  <svg width="1em" height="1em" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M34.4 18L29.5 26.6L29.4 26.5L28.2 24.4L26.9 22.1L24.5 18H27.5C27.5 17.4 27.4333 16.8 27.3 16.2C26.2 11.1 21.7 7.3 16.4 7.3C10.2 7.3 5.3 12.3 5.3 18.4C5.3 24.6 10.2 29.5 16.4 29.5C20.4 29.5 24 27.4 25.9 24.1L27.1 26.2L27.9 27.5L28.3 28.2C25.4 31.6 21.2 33.8 16.4 33.8C7.9 33.8 1 26.9 1 18.4C1 9.9 7.9 3 16.4 3C24.1 3 30.5 8.7 31.6 16.2C31.6667 16.8 31.7 17.4 31.7 18H34.4Z"
      fill={fill}
    />
    <path d="M14.1 20.2996L11.5 17.5996L9 20.0996L14.1 25.2996L23.8 15.5996L21.3 13.0996L14.1 20.2996Z" fill={fill} />
  </svg>
);

const ChargeSvg = ({ fill = "currentColor", ...props }) => (
  <svg width="1em" height="1em" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M1 21.4H8.4L16 13.5L17.7 11.7L19.4 13.5L27 21.4H34.4L17.7 4L1 21.4ZM1 33.7H8.3L15.9 25.8L17.7 24L19.4 25.8L27 33.7H34.3L17.7 16.3L1 33.7Z"
      fill={fill}
    />
  </svg>
);

const FightSvg = ({ fill = "currentColor", ...props }) => (
  <svg width="1em" height="1em" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M20.1 7.5L20.3 9L23.5 12.2L19.4 16.3L19.8 16.7L6.1 30.3L6 30.2L5.2 30.9L7.3 33L8.1 32.3L7.9 32.1L21.5 18.4L21.9 18.8L26 14.7L29.2 17.9L30.7 18.1L34.1 14.7L33.9 13.2L31.3 10.6L31.8 10L28.2 6.4L27.7 6.9L25 4.3L23.5 4.1L20.1 7.5ZM10.1 4.2L7.4 6.9L6.9 6.3L3.3 10L3.8 10.5L1.2 13.2L1 14.7L4.4 18.1L5.9 17.9L9.1 14.7L13.2 18.8L13.6 18.4L27.2 32L27 32.2L27.8 33L29.9 30.9L29.1 30.1L29 30.3L15.3 16.7L15.7 16.3L11.6 12.2L14.8 9L15 7.5L11.6 4L10.1 4.2Z"
      fill={fill}
    />
  </svg>
);

const CommandSvg = ({ fill = "currentColor", ...props }) => (
  <svg width="1em" height="1em" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M27.9685 21.969L30.9224 25.4767L26.4916 24.646C25.9993 25.3229 25.4455 25.9075 24.8301 26.3998L25.6608 31.0152L21.9685 27.969C21.3532 28.2152 20.707 28.3998 20.0301 28.5229L18.2762 35.5383L16.4301 28.4306C15.8147 28.3075 15.1993 28.1537 14.5839 27.969L11.0762 30.9229L11.907 26.3998C11.2916 25.9075 10.7378 25.3537 10.2455 24.7383L5.99931 25.5691L8.76854 22.246C8.46085 21.5691 8.24546 20.8614 8.12239 20.1229L0.830078 18.2767L8.12239 16.4306C8.24546 15.6921 8.43008 15.0152 8.67623 14.3998L5.81469 10.9844L10.1532 11.8152C10.6455 11.1998 11.1993 10.646 11.8147 10.1537L11.0762 5.90751L14.307 8.67674C14.9839 8.36905 15.7224 8.15367 16.5224 8.03059L18.2762 0.738281L20.2147 8.03059C20.8916 8.15367 21.5685 8.33828 22.2455 8.58443L25.5685 5.8152L24.8301 10.1537C25.4455 10.646 25.9993 11.1998 26.4916 11.8152L31.0147 10.9844L28.0608 14.5844C28.307 15.1998 28.4608 15.8767 28.5224 16.6152L35.6301 18.369L28.5224 20.1229C28.3993 20.7998 28.2147 21.4152 27.9685 21.969ZM25.8455 18.4614C25.8455 14.3075 22.4301 10.8921 18.2762 10.8921C14.1224 10.8921 10.707 14.3075 10.707 18.4614C10.707 22.6152 14.1224 26.0306 18.2762 26.0306C22.4301 26.0306 25.8455 22.6152 25.8455 18.4614Z"
      fill={fill}
    />
  </svg>
);

const MovementSvg = ({ fill = "currentColor", ...props }) => (
  <svg width="1em" height="1em" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M2 15.0811H34.3027L18.1514 0L2 15.0811ZM10.7568 24.1297H25.5459V8.95135H10.7568V24.1297ZM10.7568 29.6757H25.5459V26.173H10.7568V29.6757ZM10.7568 35.2216H25.5459V31.7189H10.7568V35.2216Z"
      fill={fill}
    />
  </svg>
);

const ShootingSvg = ({ fill = "currentColor", ...props }) => (
  <svg width="1em" height="1em" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M35.7008 22L32.2008 20.8C31.0008 26.6 26.4008 31.1 20.5008 32.2L21.8008 35.9H14.2008L15.5008 32.2C9.60078 31.1 5.00078 26.6 3.80078 20.8L0.300781 22V14.4L3.60078 15.6C4.60078 9.5 9.30078 4.7 15.2008 3.6L14.2008 0.5H21.8008L20.7008 3.6C26.7008 4.7 31.4008 9.5 32.3008 15.6L35.7008 14.4V22ZM29.1008 19.8L24.6008 18.2L29.2008 16.6C28.7008 11.5 24.7008 7.4 19.7008 6.7L18.0008 11.6L16.3008 6.7C11.3008 7.4 7.30078 11.5 6.80078 16.6L11.4008 18.2L6.90078 19.8C7.70078 24.6 11.6008 28.4 16.5008 29L18.0008 24.8L19.4008 29C24.4008 28.4 28.3008 24.6 29.1008 19.8Z"
      fill={fill}
    />
  </svg>
);

const phaseIcons = {
  any: AnySvg,
  charge: ChargeSvg,
  fight: FightSvg,
  command: CommandSvg,
  movement: MovementSvg,
  shooting: ShootingSvg,
};

export const PhaseIcon = ({ phase, color = "currentColor", className = "", style = {} }) => {
  const IconComponent = phaseIcons[phase];

  if (!IconComponent) {
    console.warn(`Unknown phase icon: ${phase}`);
    return null;
  }

  return (
    <IconComponent
      fill={color}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
      }}
    />
  );
};

export default PhaseIcon;
