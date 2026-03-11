import { FileText } from "lucide-react";

export const EditorCenterPanel = () => {
  return (
    <div className="designer-center-panel">
      <div className="designer-empty-state" style={{ flex: 1 }}>
        <FileText />
        <p>Select a card type to view its structure</p>
        <p style={{ fontSize: 11, marginTop: 2 }}>The field structure will appear here</p>
      </div>
    </div>
  );
};
