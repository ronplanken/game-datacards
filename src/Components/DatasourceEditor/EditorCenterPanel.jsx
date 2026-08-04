import { FileText } from "lucide-react";
import { SchemaTreeView } from "./SchemaTreeView";
import { DatasourceCardPreview } from "./DatasourceCardPreview";
import { OnboardingCenterPanel } from "./components/OnboardingCenterPanel";
import { PostCreateBanner } from "./components/PostCreateBanner";

export const EditorCenterPanel = ({
  selectedItem,
  activeDatasource,
  datasourceCount = 0,
  onNewDatasource,
  postCreateInfo,
  onDismissPostCreate,
  onAddCardType,
  onSelectDatasource,
}) => {
  const hasSelection = selectedItem && activeDatasource;

  if (!hasSelection && datasourceCount === 0) {
    return (
      <div className="designer-center-panel">
        <OnboardingCenterPanel onNewDatasource={onNewDatasource} />
      </div>
    );
  }

  return (
    <div className="designer-center-panel">
      {postCreateInfo && (
        <PostCreateBanner
          datasourceName={postCreateInfo.datasourceName}
          onDismiss={onDismissPostCreate}
          onAddCardType={onAddCardType}
          onSelectDatasource={onSelectDatasource}
        />
      )}
      {hasSelection && selectedItem.type === "card" ? (
        <DatasourceCardPreview card={selectedItem.data} activeDatasource={activeDatasource} />
      ) : hasSelection ? (
        <SchemaTreeView selectedItem={selectedItem} activeDatasource={activeDatasource} />
      ) : (
        <div className="designer-empty-state full-height">
          <FileText />
          <p>Select a card type to view its structure</p>
          <p className="designer-empty-state-subtitle">The field structure will appear here</p>
        </div>
      )}
    </div>
  );
};
