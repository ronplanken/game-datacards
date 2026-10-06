import { VALID_BASE_SYSTEMS } from "./customSchema.helpers";
import { buildCustomFormat, parseCustomFormat } from "./customSchemaBindings";

export const BUILT_IN_FORMATS = {
  "40k-10e": { label: "40K 10th Edition", gameSystem: "40k", family: "40k-unit" },
  "40k-11e": { label: "40K 11th Edition", gameSystem: "40k", family: "40k-unit" },
  aos: { label: "Age of Sigmar", gameSystem: "aos", family: "aos-warscroll" },
};

const CUSTOM_FAMILIES = {
  "40k-10e:unit": "40k-unit",
  "40k-11e:unit": "40k-unit",
};

const FAMILY_COMPATIBILITY = {
  "40k-unit": ["40k-unit"],
  "aos-warscroll": ["aos-warscroll"],
};

const BASE_SYSTEM_GAME_SYSTEMS = {
  "40k-10e": "40k",
  "40k-11e": "40k",
  aos: "aos",
};

const CUSTOM_PREFIX = "custom-";

export const isBuiltInFormat = (formatKey) => Boolean(formatKey && BUILT_IN_FORMATS[formatKey]);

export const describeFormat = (formatKey, customDatasources = []) => {
  if (!formatKey) return null;

  const builtIn = BUILT_IN_FORMATS[formatKey];
  if (builtIn) {
    return {
      key: formatKey,
      label: builtIn.label,
      gameSystem: builtIn.gameSystem,
      datasourceId: null,
      cardTypeKey: null,
      family: builtIn.family,
      builtIn: true,
    };
  }

  const parsed = parseCustomFormat(formatKey);
  if (!parsed) {
    return {
      key: formatKey,
      label: formatKey,
      gameSystem: "custom",
      datasourceId: null,
      cardTypeKey: null,
      family: formatKey,
      builtIn: false,
    };
  }

  const datasource = (customDatasources || []).find((entry) => entry?.id === parsed.datasourceId) || null;
  const cardType = datasource?.schema?.cardTypes?.find((entry) => entry.key === parsed.cardTypeKey) || null;
  const baseSystem = VALID_BASE_SYSTEMS.includes(datasource?.schema?.baseSystem) ? datasource.schema.baseSystem : null;
  const baseType = cardType?.baseType || null;

  let family = formatKey;
  if (baseSystem && baseType) {
    family = CUSTOM_FAMILIES[`${baseSystem}:${baseType}`] || `${baseSystem}:${baseType}`;
  }

  let label = formatKey;
  if (datasource && cardType) label = `${datasource.name} - ${cardType.label}`;
  else if (datasource) label = datasource.name;

  return {
    key: formatKey,
    label,
    gameSystem: BASE_SYSTEM_GAME_SYSTEMS[baseSystem] || "custom",
    datasourceId: parsed.datasourceId,
    cardTypeKey: parsed.cardTypeKey,
    family,
    builtIn: false,
  };
};

export const isFormatCompatible = (templateFormat, cardFormat, customDatasources = []) => {
  if (!templateFormat || !cardFormat) return false;
  if (templateFormat === cardFormat) return true;

  const template = describeFormat(templateFormat, customDatasources);
  const card = describeFormat(cardFormat, customDatasources);
  if (!template || !card) return false;

  const families = FAMILY_COMPATIBILITY[template.family] || [template.family];
  return families.includes(card.family);
};

export const listFormats = (customDatasources = []) => {
  const keys = Object.keys(BUILT_IN_FORMATS);

  for (const datasource of customDatasources || []) {
    for (const cardType of datasource?.schema?.cardTypes || []) {
      keys.push(buildCustomFormat(datasource.id, cardType.key));
    }
  }

  return keys;
};

export const getCompatibleFormats = (formatKey, customDatasources = []) => {
  if (!formatKey) return [];

  const compatible = listFormats(customDatasources).filter((key) =>
    isFormatCompatible(formatKey, key, customDatasources),
  );

  return compatible.includes(formatKey) ? compatible : [formatKey, ...compatible];
};

export const formatForCard = (card) => {
  const source = card?.source;
  if (!source) return null;
  if (BUILT_IN_FORMATS[source]) return source;
  if (String(source).startsWith(CUSTOM_PREFIX) && card.cardType) {
    return buildCustomFormat(source, card.cardType);
  }
  return source;
};
