import { useOptionalDataSourceStorage } from "./useDataSourceStorage";

/**
 * Returns the shared Warhammer 40K 11th edition keyword glossary carried by the
 * loaded datasource (see `get40k11eData`), or an empty array when it is
 * unavailable — an older cached datasource without the file, a different
 * datasource selected, or a card rendered outside the storage provider. Always
 * safe to call from any 11e card component; an empty glossary simply means no
 * keyword tooltips are shown.
 *
 * @returns {Array} The 11e keyword glossary entries (possibly empty)
 */
export const use11eKeywordGlossary = () => {
  const context = useOptionalDataSourceStorage();
  const glossary = context?.dataSource?.keywordGlossary;
  return Array.isArray(glossary) ? glossary : [];
};
