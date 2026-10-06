import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { GlossaryList } from "../Glossary/GlossaryList";
import "./MobileGlossaryList.css";

export const MobileGlossaryList = () => {
  const navigate = useNavigate();
  const { dataSource, selectedFaction } = useDataSourceStorage();

  const factionSlug = selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");

  const glossary = useMemo(() => {
    const entries = dataSource?.schema?.keywordGlossary;
    return Array.isArray(entries) ? entries : [];
  }, [dataSource]);

  const handleBack = () => {
    navigate(`/mobile/${factionSlug}`);
  };

  return (
    <div
      className="mobile-glossary-page"
      style={{
        "--banner-colour": selectedFaction?.colours?.banner,
        "--header-colour": selectedFaction?.colours?.header,
      }}>
      <div className="mobile-glossary-header">
        <button className="mobile-glossary-back" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="mobile-glossary-title">Keyword Glossary</h1>
        <div className="mobile-glossary-count">{glossary.length}</div>
      </div>

      <GlossaryList glossary={glossary} />
    </div>
  );
};
