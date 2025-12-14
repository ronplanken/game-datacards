import React, { useRef, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Layout, Row } from "antd";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import "antd/dist/antd.min.css";
import "../App.css";
import "../style.less";

import { AppHeader } from "../Components/AppHeader";
import { ViewerLeftPanel } from "../Components/Viewer/ViewerLeftPanel";
import { ViewerCardDisplay, HiddenCardDisplay } from "../Components/Viewer/ViewerCardDisplay";
import { ViewerFloatingToolbar } from "../Components/Viewer/ViewerFloatingToolbar";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { useAutoFitScale } from "../Hooks/useAutoFitScale";
import { useViewerNavigation } from "../Hooks/useViewerNavigation";
import { useMobileSharing } from "../Hooks/useMobileSharing";
import { Warhammer40K10eCardDisplay } from "../Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";
import { AgeOfSigmarCardDisplay } from "../Components/AgeOfSigmar/CardDisplay";
import "../Components/Viewer/ViewerFloatingToolbar.css";

const { Content } = Layout;

export const Viewer = () => {
  const location = useLocation();

  // Check if mobile and redirect to mobile viewer
  const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

  if (isMobile) {
    // Replace /viewer with /mobile, preserving the rest of the path
    const mobilePath = location.pathname.replace(/^\/viewer/, "/mobile") + location.search;
    return <Navigate to={mobilePath} replace />;
  }

  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const { activeCard } = useCardStorage();
  const { shareLink, htmlToImageConvert } = useMobileSharing();

  // Initialize the navigation hook to sync URL with state
  useViewerNavigation();

  const [side, setSide] = useState("front");

  // Refs for sharing functionality
  const cardContainerRef = useRef(null);
  const fullCardRef = useRef(null);
  const viewerCardRef = useRef(null);
  const overlayRef = useRef(null);

  // Set default data source on mount if none selected
  useEffect(() => {
    if (!settings.selectedDataSource) {
      updateSettings({
        ...settings,
        selectedDataSource: "40k-10e",
      });
    }
  }, []);

  // Determine card type for proper scaling
  const getCardType = () => {
    if (!activeCard) return "unit";
    if (activeCard.cardType === "stratagem") return "stratagem";
    if (activeCard.cardType === "enhancement") return "enhancement";
    if (settings.showCardsAsDoubleSided || activeCard.variant === "full") return "unitFull";
    return "unit";
  };

  // Use auto-fit hook
  const { autoScale } = useAutoFitScale(cardContainerRef, getCardType(), settings.autoFitEnabled !== false);

  // Determine effective scale based on mode
  const effectiveScale = settings.autoFitEnabled !== false ? autoScale : (settings.zoom || 100) / 100;

  // Get faction colors
  const cardFaction = dataSource?.data?.find((faction) => faction.id === activeCard?.faction_id);

  // Sharing handlers
  const handleShareLink = () => shareLink();
  const handleShareFullCard = () => htmlToImageConvert(fullCardRef, overlayRef);
  const handleShareMobileCard = () => htmlToImageConvert(viewerCardRef, overlayRef);

  // Render card based on source
  const renderCard = () => {
    if (!activeCard) return null;

    switch (activeCard.source) {
      case "40k-10e":
        return <Warhammer40K10eCardDisplay side={side} />;
      case "40k":
        return <Warhammer40KCardDisplay />;
      case "basic":
        return <Warhammer40KCardDisplay />;
      case "necromunda":
        return <NecromundaCardDisplay />;
      case "aos":
        return <AgeOfSigmarCardDisplay />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <AppHeader showModals={true} />

      <Content style={{ height: "calc(100vh - 64px)" }}>
        <PanelGroup direction="horizontal" autoSaveId="viewerDesktopLayout">
          <Panel defaultSize={20} minSize={15} order={1}>
            <ViewerLeftPanel />
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={80} order={2}>
            <div
              ref={cardContainerRef}
              style={{
                height: "calc(100vh - 64px)",
                display: "block",
                overflow: "auto",
                position: "relative",
                "--card-scaling-factor": effectiveScale,
                "--banner-colour": cardFaction?.colours?.banner,
                "--header-colour": cardFaction?.colours?.header,
              }}
              className={`viewer-card-container data-${activeCard?.source}`}>
              <Row style={{ overflow: "hidden", justifyContent: "center" }}>{renderCard()}</Row>
              <ViewerFloatingToolbar
                side={side}
                setSide={setSide}
                onShareLink={handleShareLink}
                onShareFullCard={handleShareFullCard}
                onShareMobileCard={handleShareMobileCard}
              />
            </div>
          </Panel>
        </PanelGroup>

        {/* Hidden overlay for sharing screenshots */}
        <div
          ref={overlayRef}
          style={{
            display: "none",
            position: "absolute",
            height: "100vh",
            width: "100vw",
            backgroundColor: "#00000099",
            top: "0px",
            bottom: "0px",
            zIndex: 9999,
          }}
        />

        {/* Hidden divs for image export */}
        <div
          ref={fullCardRef}
          style={{
            display: "none",
            "--banner-colour": cardFaction?.colours?.banner,
            "--header-colour": cardFaction?.colours?.header,
            backgroundColor: "#d8d8da",
            zIndex: "-9999",
            position: "absolute",
            top: "0px",
            left: "0px",
          }}
          className={`data-${activeCard?.source}`}>
          <Row style={{ overflow: "hidden" }}>
            {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay side={side} />}
            {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
            {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
            {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
            {activeCard?.source === "aos" && <AgeOfSigmarCardDisplay />}
          </Row>
        </div>
        <div
          ref={viewerCardRef}
          style={{
            display: "none",
            "--banner-colour": cardFaction?.colours?.banner,
            "--header-colour": cardFaction?.colours?.header,
            backgroundColor: "#d8d8da",
            zIndex: "-9999",
            position: "absolute",
            top: "0px",
            left: "0px",
          }}
          className={`data-${activeCard?.source}`}>
          <Row style={{ overflow: "hidden" }}>
            {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay side={side} type="viewer" />}
            {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
            {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
            {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
            {activeCard?.source === "aos" && <AgeOfSigmarCardDisplay type="viewer" />}
          </Row>
        </div>
      </Content>
    </Layout>
  );
};
