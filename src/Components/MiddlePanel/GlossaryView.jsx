import { useMemo } from "react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { GlossaryList } from "../Glossary/GlossaryList";
import "./GlossaryView.css";

/**
 * Desktop middle-panel view: a searchable encyclopedia of the active custom
 * datasource's keyword glossary. Reads the glossary straight from the active
 * datasource in context — no card selection involved.
 */
export const GlossaryView = () => {
  const { dataSource, selectedFaction } = useDataSourceStorage();

  const glossary = useMemo(() => {
    const entries = dataSource?.schema?.keywordGlossary;
    return Array.isArray(entries) ? entries : [];
  }, [dataSource]);

  return (
    <div
      className="glossary-view"
      style={{
        "--banner-colour": selectedFaction?.colours?.banner,
        "--header-colour": selectedFaction?.colours?.header,
      }}>
      <div className="glossary-view-header">
        <h1 className="glossary-view-title">Keyword Glossary</h1>
        <div className="glossary-view-count">{glossary.length}</div>
      </div>
      <GlossaryList glossary={glossary} />
    </div>
  );
};
