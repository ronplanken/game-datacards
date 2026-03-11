import { Settings } from "lucide-react";

export const EditorRightPanel = ({ selectedItem = null }) => {
  return (
    <div className="designer-properties-panel props-panel">
      {!selectedItem && (
        <div className="props-empty">
          <Settings size={32} />
          <p>Select a datasource or card type</p>
        </div>
      )}
    </div>
  );
};
