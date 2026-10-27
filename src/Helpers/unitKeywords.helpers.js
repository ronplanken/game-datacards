import { localize } from "./localization.helpers";

const englishKey = (keyword) => localize(keyword);

const modelList = (modelKeywords) => (Array.isArray(modelKeywords) ? modelKeywords : []);

export function splitKeywords(keywords, modelKeywords, keyOf = englishKey) {
  const modelOnly = new Set(modelList(modelKeywords).flatMap((model) => (model?.keywords ?? []).map(keyOf)));
  return (keywords || []).filter((keyword) => !modelOnly.has(keyOf(keyword)));
}

export function joinKeywords(shared, modelKeywords, keyOf = englishKey) {
  const seen = new Set();
  const joined = [];
  for (const keyword of [...(shared || []), ...modelList(modelKeywords).flatMap((model) => model?.keywords ?? [])]) {
    const key = keyOf(keyword);
    if (seen.has(key)) continue;
    seen.add(key);
    joined.push(keyword);
  }
  return joined;
}

export function withModelKeywords(keywords, modelKeywords, nextModelKeywords, keyOf = englishKey) {
  const shared = splitKeywords(keywords, modelKeywords, keyOf);
  return { modelKeywords: nextModelKeywords, keywords: joinKeywords(shared, nextModelKeywords, keyOf) };
}

export function getKeywordGroups(keywords, modelKeywords) {
  const models = modelList(modelKeywords).filter((model) => model?.keywords?.length > 0);
  if (models.length === 0) return null;
  const shared = splitKeywords(keywords, models);
  const groups = models.map((model) => ({ name: model.name, keywords: model.keywords }));
  return shared.length > 0 ? [{ name: null, keywords: shared }, ...groups] : groups;
}
