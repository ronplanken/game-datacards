// Invulnerable Save Shield icon for Warhammer 40k 10th edition
// Inline SVG to fix MacOS print-to-PDF rendering issues

export const InvulnShield = ({ fill = "currentColor", className = "", style = {}, children, ...props }) => (
  <div
    className={className}
    style={{
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      ...style,
    }}
    {...props}>
    <svg
      viewBox="0 0 17 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
      }}>
      <path
        d="M8.49352 0H0V11.4126C0 14.0601 1.47826 18.8369 8.49352 21C15.5088 18.8369 17 14.0601 17 11.4126V0H8.49352Z"
        fill={fill}
      />
    </svg>
    {children && <div style={{ position: "relative", zIndex: 1 }}>{children}</div>}
  </div>
);

// Simple shield shape without children wrapper - for use as a background
export const InvulnShieldSvg = ({ fill = "currentColor", className = "", style = {} }) => (
  <svg
    viewBox="0 0 17 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{
      width: "100%",
      height: "100%",
      display: "block",
      ...style,
    }}>
    <path
      d="M8.49352 0H0V11.4126C0 14.0601 1.47826 18.8369 8.49352 21C15.5088 18.8369 17 14.0601 17 11.4126V0H8.49352Z"
      fill={fill}
    />
  </svg>
);

export default InvulnShield;
