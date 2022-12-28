export const Page = ({ faction, size, customSize, children, style }) => {
  let pageSize;

  switch (size) {
    case "A5":
      pageSize = { height: "210mm", width: "148mm" };
      break;
    case "A4":
      pageSize = { height: "297mm", width: "210mm" };
      break;
    case "Letter (US)":
      pageSize = { height: "279mm", width: "216mm" };
      break;
    case "Half-letter (US)":
      pageSize = { height: "216mm", width: "139mm" };
      break;
    case "custom":
      pageSize = customSize;
      break;
    default:
      pageSize = { height: "297mm", width: "210mm" };
      break;
  }
  return (
    <div
      style={{
        ...style,
        ...pageSize,
      }}
      className={`${faction || "data-basic"} print-page`}>
      {children}
    </div>
  );
};
