export const Page = ({ faction, size, children, style }) => {
  let pageSize;

  switch (size) {
    case "A4":
      pageSize = { height: "297mm", width: "210mm" };
      break;
    case "Letter (US)":
      pageSize = { height: "279mm", width: "216mm" };
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
