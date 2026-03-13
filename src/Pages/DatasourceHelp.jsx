import React, { useState, useEffect, useRef } from "react";
import { Typography, Layout, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useUmami } from "../Hooks/useUmami";
import { AppHeader } from "../Components/AppHeader";
import "./DesignerHelp.css";

const { Title, Paragraph, Text } = Typography;
const { Sider, Content } = Layout;

const sections = [
  { key: "getting-started", label: "Getting Started" },
  { key: "creating-a-datasource", label: "Creating a Datasource" },
  { key: "the-workspace", label: "The Workspace" },
  { key: "card-types", label: "Card Types" },
  { key: "defining-fields", label: "Defining Fields" },
  { key: "stats-and-profiles", label: "Stats and Profiles" },
  { key: "weapons", label: "Weapons" },
  { key: "abilities", label: "Abilities" },
  { key: "working-with-cards", label: "Working with Cards" },
  { key: "card-preview", label: "Card Preview" },
  { key: "import-and-export", label: "Import and Export" },
  { key: "base-systems", label: "Base Systems" },
  { key: "tips", label: "Tips" },
];

export const DatasourceHelp = () => {
  const navigate = useNavigate();
  const { trackEvent } = useUmami();
  const [activeKey, setActiveKey] = useState("getting-started");
  const contentRef = useRef(null);

  useEffect(() => {
    trackEvent("datasource-help-view", {});
  }, [trackEvent]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const sectionEls = container.querySelectorAll("[data-section]");
      let current = "getting-started";
      for (const el of sectionEls) {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.top - containerRect.top <= 80) {
          current = el.getAttribute("data-section");
        }
      }
      setActiveKey(current);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (key) => {
    const el = contentRef.current?.querySelector(`[data-section="${key}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <AppHeader showModals={false} showActions={false} pageTitle="Datasource Help" />
      <Layout className="designer-help-layout">
        <Sider className="designer-help-sider" width={260}>
          <div className="designer-help-sider-header">
            <button className="designer-help-back-btn" onClick={() => navigate("/datasources")}>
              <ArrowLeft size={16} />
              Back to Datasources
            </button>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={sections.map((s) => ({ key: s.key, label: s.label }))}
            onClick={({ key }) => scrollToSection(key)}
            className="designer-help-menu"
          />
        </Sider>
        <Content className="designer-help-content" ref={contentRef}>
          <div className="designer-help-content-inner">
            {/* Getting Started */}
            <section data-section="getting-started">
              <Typography>
                <Title level={2}>Getting Started</Title>
                <Paragraph>
                  The Datasource Editor lets you design custom card structures for your tabletop games. A datasource
                  defines everything about your cards — what stats they track, what fields they display, and how the
                  data is organized.
                </Paragraph>
                <Paragraph>
                  {
                    "Build datasources for Warhammer 40,000, Age of Sigmar, or any game system you like. Each datasource can hold multiple card types — units, stratagems, enhancements, rules, or whatever your game needs."
                  }
                </Paragraph>
              </Typography>
            </section>

            {/* Creating a Datasource */}
            <section data-section="creating-a-datasource">
              <Typography>
                <Title level={2}>Creating a Datasource</Title>
                <Paragraph>
                  {"Click "}
                  <Text strong>New Datasource</Text>
                  {" in the left panel to get started. A step-by-step wizard walks you through the setup:"}
                </Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Name, version, and author</Text> — Identify your datasource so you can find it later.
                  </li>
                  <li>
                    <Text strong>Base system</Text> — Choose Warhammer 40K 10th Edition, Age of Sigmar, or Blank. This
                    determines which presets are available and how your cards look in preview.
                  </li>
                  <li>
                    <Text strong>First card type</Text> — Define the first type of card your datasource will contain.
                  </li>
                </ul>
              </Typography>
            </section>

            {/* The Workspace */}
            <section data-section="the-workspace">
              <Typography>
                <Title level={2}>The Workspace</Title>
                <Paragraph>The editor is split into three panels:</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Left panel</Text> — Your datasource structure. Browse card types, manage individual
                    cards, and control the overall organization.
                  </li>
                  <li>
                    <Text strong>Center panel</Text> — A live preview of the selected card. When you select a card type
                    {"instead of a card, it shows a tree view of the card type's field structure."}
                  </li>
                  <li>
                    <Text strong>Right panel</Text> — The properties editor. What you see here depends on your
                    selection: card data, field definitions, or datasource settings.
                  </li>
                </ul>
              </Typography>
            </section>

            {/* Card Types */}
            <section data-section="card-types">
              <Typography>
                <Title level={2}>Card Types</Title>
                <Paragraph>
                  Card types define the kinds of cards in your datasource. Each one is built on a base type that
                  determines its structure:
                </Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Unit</Text> — Stats, weapons, and abilities. Use this for datasheets, warscrolls, or
                    fighter cards.
                  </li>
                  <li>
                    <Text strong>Rule</Text> — A title, description, and a list of nested rules.
                  </li>
                  <li>
                    <Text strong>Enhancement</Text> — Custom fields plus a keywords collection.
                  </li>
                  <li>
                    <Text strong>Stratagem</Text> — A title, phase, and description.
                  </li>
                </ul>
                <Paragraph>Add, remove, and reorder card types using the controls in the left panel.</Paragraph>
              </Typography>
            </section>

            {/* Defining Fields */}
            <section data-section="defining-fields">
              <Typography>
                <Title level={2}>Defining Fields</Title>
                <Paragraph>
                  Each card type has a set of fields that define what data it holds. Select a card type in the left
                  panel to open its field editor in the right panel.
                </Paragraph>
                <Paragraph>
                  For unit card types, you get specialized editors for stats, weapons, abilities, and metadata. For
                  other types, you get a general-purpose field editor.
                </Paragraph>
                <Paragraph>Every field has three properties:</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Key</Text> — The internal identifier (e.g.,{" "}
                    <code className="designer-help-code">m</code> for Movement). Not shown on the card.
                  </li>
                  <li>
                    <Text strong>Label</Text> — The display name shown on the card (e.g., {'"Movement"'}).
                  </li>
                  <li>
                    <Text strong>Type</Text> — What kind of data the field holds: text, rich text, dropdown list, or
                    true/false toggle.
                  </li>
                </ul>
              </Typography>
            </section>

            {/* Stats and Profiles */}
            <section data-section="stats-and-profiles">
              <Typography>
                <Title level={2}>Stats and Profiles</Title>
                <Paragraph>
                  Unit card types have a dedicated stats editor for fields like Movement, Toughness, Wounds, and Save.
                </Paragraph>
                <Paragraph>
                  Mark any stat as <Text strong>special</Text> to highlight it with a custom color — useful for
                  invulnerable saves or unique abilities. Special stats can also be hidden when empty, so they only
                  appear on cards that use them.
                </Paragraph>
                <Paragraph>
                  Turn on <Text strong>Allow multiple profiles</Text> when a unit has models with different stat lines,
                  like a squad where the sergeant has better stats than the rest of the squad.
                </Paragraph>
              </Typography>
            </section>

            {/* Weapons */}
            <section data-section="weapons">
              <Typography>
                <Title level={2}>Weapons</Title>
                <Paragraph>
                  Define weapon types for your unit cards — typically one for ranged weapons and one for melee weapons.
                </Paragraph>
                <Paragraph>
                  Each weapon type has its own columns. For a Warhammer 40K stat line, you might use Range, Attacks,
                  Skill, Strength, AP, and Damage. Customize these to match whatever game system you are building for.
                </Paragraph>
                <Paragraph>
                  You can also toggle whether weapons support keywords (like <Text italic>Rapid Fire</Text> or{" "}
                  <Text italic>Devastating Wounds</Text>) and whether they can have multiple profiles (like a
                  combi-weapon with two firing modes).
                </Paragraph>
              </Typography>
            </section>

            {/* Abilities */}
            <section data-section="abilities">
              <Typography>
                <Title level={2}>Abilities</Title>
                <Paragraph>
                  Set up ability categories for your unit cards. You might have Core Abilities, Faction Abilities, and
                  Wargear — or any categories your game system needs.
                </Paragraph>
                <Paragraph>Each category can display its abilities in one of three formats:</Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Name only</Text> — Just the ability name (e.g., {'"Deadly Demise D3"'}).
                  </li>
                  <li>
                    <Text strong>Name and description</Text> — The ability name with a rules description below it.
                  </li>
                  <li>
                    <Text strong>Toggle</Text> — A true/false flag, useful for traits like {'"Leader"'} or{" "}
                    {'"Deep Strike."'}
                  </li>
                </ul>
                <Paragraph>Add a header label to give each category a visible title on the card.</Paragraph>
              </Typography>
            </section>

            {/* Working with Cards */}
            <section data-section="working-with-cards">
              <Typography>
                <Title level={2}>Working with Cards</Title>
                <Paragraph>
                  Once your card types are set up, you can start adding cards. Click the <Text strong>+</Text> button
                  next to the Cards header in the left panel to create a new card.
                </Paragraph>
                <Paragraph>
                  Cards are grouped by type using tabs at the top of the card list. Select any card to see its live
                  preview in the center panel and edit its data in the right panel. Changes appear on the preview as you
                  type.
                </Paragraph>
              </Typography>
            </section>

            {/* Card Preview */}
            <section data-section="card-preview">
              <Typography>
                <Title level={2}>Card Preview</Title>
                <Paragraph>
                  The center panel shows a live preview of the selected card. How the card looks depends on your base
                  system:
                </Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Warhammer 40K and Age of Sigmar</Text> cards are rendered in a style that matches the
                    official game format.
                  </li>
                  <li>
                    <Text strong>Custom and Blank</Text> systems use generic card components.
                  </li>
                </ul>
                <Paragraph>
                  Use the zoom toolbar at the bottom to adjust the view. Toggle <Text strong>auto-fit</Text> to
                  automatically scale the card to fill the available space, or set a manual zoom level.
                </Paragraph>
              </Typography>
            </section>

            {/* Import and Export */}
            <section data-section="import-and-export">
              <Typography>
                <Title level={2}>Import and Export</Title>
                <Paragraph>
                  <Text strong>Export</Text> your datasource as a JSON file to create a backup or share it with others.
                  The export includes your field definitions, metadata, and faction colors — but not individual card
                  data.
                </Paragraph>
                <Paragraph>
                  <Text strong>Import</Text> a JSON file to load a datasource structure. Drag and drop the file onto the
                  {
                    "import dialog or use the file picker. The file is validated automatically — you'll see any problems"
                  }
                  {" listed before anything changes."}
                </Paragraph>
              </Typography>
            </section>

            {/* Base Systems */}
            <section data-section="base-systems">
              <Typography>
                <Title level={2}>Base Systems</Title>
                <Paragraph>
                  The base system you choose when creating a datasource sets the starting point for your card types:
                </Paragraph>
                <ul className="designer-help-list">
                  <li>
                    <Text strong>Warhammer 40K 10th Edition</Text> — Pre-configures stat lines, weapon types, and
                    ability categories to match the official 40K datacard format.
                  </li>
                  <li>
                    <Text strong>Age of Sigmar</Text> — Sets up warscroll-style fields and structure.
                  </li>
                  <li>
                    <Text strong>Blank</Text> — No presets. You define every field from scratch.
                  </li>
                </ul>
                <Paragraph>
                  The base system also determines which visual style is used when previewing your cards.
                </Paragraph>
              </Typography>
            </section>

            {/* Tips */}
            <section data-section="tips">
              <Typography>
                <Title level={2}>Tips</Title>

                <Title level={4}>Back up your work</Title>
                <Paragraph>
                  {
                    "Datasources are stored in your browser. Clearing your browser data removes them. Export regularly to keep backups."
                  }
                </Paragraph>

                <Title level={4}>Use short, clear keys</Title>
                <Paragraph>
                  Give fields keys like <code className="designer-help-code">m</code> for Movement or{" "}
                  <code className="designer-help-code">w</code> for Wounds. These are used internally and will not
                  appear on your cards.
                </Paragraph>

                <Title level={4}>Check the tree view</Title>
                <Paragraph>
                  {
                    "Select a card type in the left panel to see a complete overview of its field structure in the center panel. This is the fastest way to review your setup."
                  }
                </Paragraph>
              </Typography>
            </section>
          </div>
        </Content>
      </Layout>
    </>
  );
};
