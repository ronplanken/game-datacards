import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 333 472" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_803_2" fill="white">
      <rect width="332.051" height="472" rx="16" />
    </mask>
    <rect width="332.051" height="472" rx="16" stroke="black" strokeWidth="64" mask="url(#path-1-inside-1_803_2)" />
  </svg>
);

export const List = (props) => <Icon component={svgIcon} {...props} />;
