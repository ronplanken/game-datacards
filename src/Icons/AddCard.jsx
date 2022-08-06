import Icon from "@ant-design/icons";

const svgIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 334 471" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M32 301.314V32H302V438.423H168.8V470.423H318C326.837 470.423 334 463.259 334 454.423V16C334 7.16344 326.837 0 318 0H16C7.16344 0 0 7.16344 0 16V301.314H32Z"
      fill="white"
    />
    <path d="M97 244H129V341H97V244Z" fill="white" />
    <path d="M97 373H129V470H97V373Z" fill="white" />
    <path d="M0 373V341H97H129H225V373H129H97H0Z" fill="white" />
  </svg>
);

export const AddCard = (props) => <Icon component={svgIcon} {...props} />;
