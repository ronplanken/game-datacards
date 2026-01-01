/**
 * Page component - Represents a single printable page.
 * Handles page size calculations and displays page number in preview.
 */
export const Page = ({ faction, size, customSize, orientation, children, style, pageNumber, totalPages }) => {
  let pageSize;

  switch (size) {
    case "A5":
      pageSize = { height: "209.5mm", width: "148mm" };
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

  if (orientation === "landscape") {
    pageSize = { height: pageSize.width, width: pageSize.height };
  }

  // Build page label for preview
  const pageLabel = pageNumber
    ? totalPages
      ? `Page ${pageNumber} of ${totalPages}`
      : `Page ${pageNumber}`
    : undefined;

  return (
    <div
      style={{
        ...style,
        ...pageSize,
        maxHeight: pageSize.height, // Prevent flex container from expanding beyond page height
      }}
      className={`${faction || "data-basic"} print-page`}
      data-page-number={pageLabel}>
      {children}
    </div>
  );
};
