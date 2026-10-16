import { localize } from "./localization.helpers";

export function getKeywordGroups(keywords, modelKeywords) {
  const models = (Array.isArray(modelKeywords) ? modelKeywords : []).filter((model) => model?.keywords?.length > 0);
  if (models.length === 0) return null;
  const modelOnly = new Set(models.flatMap((model) => model.keywords.map((keyword) => localize(keyword))));
  const shared = (keywords || []).filter((keyword) => !modelOnly.has(localize(keyword)));
  const groups = models.map((model) => ({ name: model.name, keywords: model.keywords }));
  return shared.length > 0 ? [{ name: null, keywords: shared }, ...groups] : groups;
}
