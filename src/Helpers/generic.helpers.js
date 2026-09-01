export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Human readable size for an uploaded file, as shown next to card images and
 * faction symbols. Returns an empty string when the size is unknown.
 */
export const formatFileSize = (bytes) => {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round((bytes / 1048576) * 10) / 10} MB`;
};
