import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { MarkdownDisplay } from "../MarkdownDisplay";
import { StratagemCard } from "../Warhammer40k-10e/StratagemCard";
import { BottomSheet } from "./Mobile/BottomSheet";
import "./MobileFaction.css";

// Expandable item component for stratagems, enhancements, and rules
const ExpandableItem = ({ title, cost, costLabel = "CP", children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`expandable-item ${isOpen ? "open" : ""}`}>
      <button className="expandable-item-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="expandable-item-title">{title}</span>
        {cost !== undefined && (
          <span className="expandable-item-cost">
            {cost} {costLabel}
          </span>
        )}
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className="expandable-item-content">{children}</div>}
    </div>
  );
};

// Helper to convert single newlines to markdown line breaks
const formatRuleText = (text) => {
  // Replace single newlines with double newlines for proper paragraph breaks
  // But preserve existing double newlines
  return text?.replace(/\n/g, "\n\n").replace(/\n\n\n\n/g, "\n\n") || "";
};

// Rule content component for rendering rule parts with different types
const RuleContent = ({ rules }) => (
  <div className="rule-content">
    {[...rules]
      .sort((a, b) => a.order - b.order)
      .map((part, index) => {
        // Skip examples (quote and textItalic types)
        if (part.type === "quote" || part.type === "textItalic") {
          return null;
        }
        const formattedText = formatRuleText(part.text);
        switch (part.type) {
          case "header":
            return (
              <h4 key={index} className="rule-header">
                {part.text}
              </h4>
            );
          case "accordion":
            return (
              <div key={index} className="rule-accordion-item">
                <MarkdownDisplay content={formattedText} />
              </div>
            );
          default:
            return (
              <div key={index} className="rule-text">
                <MarkdownDisplay content={formattedText} />
              </div>
            );
        }
      })}
  </div>
);

// Section header component
const SectionHeader = ({ title }) => (
  <div className="mobile-faction-section-header">
    <span>{title}</span>
  </div>
);

export const MobileFaction = () => {
  const navigate = useNavigate();
  const { selectedFaction } = useDataSourceStorage();
  const [selectedDetachment, setSelectedDetachment] = useState();
  const [showDetachmentPicker, setShowDetachmentPicker] = useState(false);
  const [stratagemTab, setStratagemTab] = useState("faction");
  const { settings, updateSettings } = useSettingsStorage();

  const factionSlug = selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");

  const handleBrowseUnits = () => {
    navigate(`/mobile/${factionSlug}/units`);
  };

  useEffect(() => {
    if (settings?.selectedDetachment?.[selectedFaction?.id]) {
      setSelectedDetachment(settings?.selectedDetachment?.[selectedFaction?.id]);
    } else {
      setSelectedDetachment(selectedFaction?.detachments?.[0]);
    }
  }, [selectedFaction, settings]);

  const handleSelectDetachment = (detachment) => {
    setSelectedDetachment(detachment);
    updateSettings({
      ...settings,
      selectedDetachment: { ...settings.selectedDetachment, [selectedFaction.id]: detachment },
    });
    setShowDetachmentPicker(false);
  };

  // Filter stratagems by detachment
  const factionStratagems =
    selectedFaction?.stratagems?.filter(
      (stratagem) => stratagem?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() || !stratagem.detachment
    ) || [];

  const coreStratagems = selectedFaction?.basicStratagems || [];

  // Filter enhancements by detachment
  const enhancements =
    selectedFaction?.enhancements?.filter(
      (enhancement) =>
        enhancement?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() || !enhancement.detachment
    ) || [];

  // Filter detachment rules by selected detachment
  const detachmentRules =
    selectedFaction?.rules?.detachment?.filter(
      (rule) => rule.detachment?.toLowerCase() === selectedDetachment?.toLowerCase()
    ) || [];

  return (
    <div
      className="mobile-faction-page"
      style={{
        "--banner-colour": selectedFaction?.colours?.banner,
        "--header-colour": selectedFaction?.colours?.header,
      }}>
      {/* Header */}
      <div className="mobile-faction-header">
        <h1 className="mobile-faction-title">{selectedFaction?.name}</h1>
      </div>

      {/* Browse Units Button */}
      <button className="mobile-faction-units-button" onClick={handleBrowseUnits}>
        <List size={18} />
        <span>Browse All Units</span>
        <span className="units-count">{selectedFaction?.datasheets?.length || 0}</span>
        <ChevronRight size={18} />
      </button>

      {/* Detachment Picker */}
      {selectedFaction?.detachments?.length > 1 && (
        <div className="mobile-faction-detachment">
          <SectionHeader title="Detachment" />
          <button className="detachment-selector" onClick={() => setShowDetachmentPicker(true)}>
            <span>{selectedDetachment || "Select Detachment"}</span>
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      {/* Army Rules Section */}
      {selectedFaction?.rules?.army?.length > 0 && (
        <div className="mobile-faction-army-rules">
          <SectionHeader title="Army Rules" />
          <div className="rules-list">
            {selectedFaction.rules.army.map((rule) => (
              <ExpandableItem key={rule.name} title={rule.name}>
                <RuleContent rules={rule.rules} />
              </ExpandableItem>
            ))}
          </div>
        </div>
      )}

      {/* Detachment Rules Section */}
      {detachmentRules.length > 0 && (
        <div className="mobile-faction-detachment-rules">
          <SectionHeader title="Detachment Rules" />
          <div className="rules-list">
            {detachmentRules.map((rule) => (
              <ExpandableItem key={rule.name} title={rule.name}>
                <RuleContent rules={rule.rules} />
              </ExpandableItem>
            ))}
          </div>
        </div>
      )}

      {/* Stratagems Section */}
      <div className="mobile-faction-stratagems">
        <SectionHeader title="Stratagems" />

        {/* Stratagem Toggle */}
        <div className="stratagem-toggle">
          <button
            className={`stratagem-toggle-btn ${stratagemTab === "faction" ? "active" : ""}`}
            onClick={() => setStratagemTab("faction")}>
            Faction
          </button>
          <button
            className={`stratagem-toggle-btn ${stratagemTab === "core" ? "active" : ""}`}
            onClick={() => setStratagemTab("core")}>
            Core
          </button>
        </div>

        {/* Stratagem List */}
        <div className="stratagem-list">
          {stratagemTab === "faction" && (
            <>
              {factionStratagems.length > 0 ? (
                factionStratagems.map((stratagem, index) => (
                  <ExpandableItem
                    key={`${stratagem.detachment}-${stratagem.name}-${index}`}
                    title={stratagem.name}
                    cost={stratagem.cost}
                    costLabel="CP">
                    <div className="data-40k-10e">
                      <StratagemCard stratagem={stratagem} paddingTop="0" containerClass="mobile" />
                    </div>
                  </ExpandableItem>
                ))
              ) : (
                <div className="empty-state">No stratagems found for this detachment</div>
              )}
            </>
          )}

          {stratagemTab === "core" && (
            <>
              {coreStratagems.map((stratagem) => (
                <ExpandableItem key={stratagem.name} title={stratagem.name} cost={stratagem.cost} costLabel="CP">
                  <div className="data-40k-10e">
                    <StratagemCard stratagem={stratagem} paddingTop="0" containerClass="stratagem mobile" />
                  </div>
                </ExpandableItem>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Enhancements Section */}
      <div className="mobile-faction-enhancements">
        <SectionHeader title="Enhancements" />

        <div className="enhancement-list">
          {enhancements.length > 0 ? (
            enhancements.map((enhancement) => (
              <ExpandableItem
                key={`${enhancement.detachment}-${enhancement.name}`}
                title={enhancement.name}
                cost={enhancement.cost}
                costLabel="pts">
                <div className="enhancement-description">
                  <MarkdownDisplay content={enhancement.description.replaceAll("■", "\n ■")} />
                </div>
              </ExpandableItem>
            ))
          ) : (
            <div className="empty-state">No enhancements found for this detachment</div>
          )}
        </div>
      </div>

      {/* Detachment Picker Bottom Sheet */}
      <BottomSheet
        isOpen={showDetachmentPicker}
        onClose={() => setShowDetachmentPicker(false)}
        title="Select Detachment">
        <div className="detachment-picker-list">
          {selectedFaction?.detachments?.map((detachment) => (
            <button
              key={detachment}
              className={`detachment-picker-item ${selectedDetachment === detachment ? "selected" : ""}`}
              onClick={() => handleSelectDetachment(detachment)}>
              <span>{detachment}</span>
              {selectedDetachment === detachment && <span className="detachment-check">✓</span>}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};
