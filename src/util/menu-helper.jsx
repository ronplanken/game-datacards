/**
 * Build category menu items with sub-categories shown indented under their parents
 * @param {Array<{uuid: string, name: string, type: string, parentId?: string}>} categories - Array of category objects
 * @returns {Array<{key: string, label: string|JSX.Element}>} Menu items for dropdown
 */
export const buildCategoryMenuItems = (categories) => {
  const items = [];
  categories
    .filter((cat) => !cat.parentId)
    .forEach((cat) => {
      items.push({
        key: cat.uuid,
        label: cat.name,
      });

      if (cat.type !== "list") {
        categories
          .filter((sub) => sub.parentId === cat.uuid)
          .forEach((sub) => {
            items.push({
              key: sub.uuid,
              label: <span style={{ paddingLeft: 12, opacity: 0.7 }}>└ {sub.name}</span>,
            });
          });
      }
    });
  return items;
};
