// Build category menu items with sub-categories shown under their parents
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
