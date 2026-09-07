import { useTemplateStorage } from "../Premium";

export const templateCardWidth = (templates, card) => {
  if (!card?.templateId || !Array.isArray(templates)) return null;
  const template = templates.find((t) => t.uuid === card.templateId);
  const width = Number(template?.canvas?.width);
  return Number.isFinite(width) && width > 0 ? width : null;
};

export function useTemplateCardWidth(card) {
  const { templateStorage } = useTemplateStorage();
  return templateCardWidth(templateStorage?.templates, card);
}
