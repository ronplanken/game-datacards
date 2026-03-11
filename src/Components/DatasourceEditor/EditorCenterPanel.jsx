import { FileText } from "lucide-react";

export const EditorCenterPanel = () => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--designer-bg-deep)",
      }}>
      <div className="designer-empty-state" style={{ flex: 1 }}>
        <FileText />
        <p>Select a card type to view its schema</p>
      </div>
    </div>
  );
};
