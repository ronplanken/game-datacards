import React, { useEffect, useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Col, Grid, Layout, Row } from "antd";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "antd/dist/antd.min.css";
import "../App.css";
import "../style.less";
import "../mobile.less";

import { MobileSearchHeader } from "../Components/Viewer/MobileSearchHeader";
import { MobileSearchDropdown } from "../Components/Viewer/MobileSearchDropdown";
import { MobileSearchFactionFilter } from "../Components/Viewer/MobileSearchFactionFilter";
import { MobileNav } from "../Components/Viewer/MobileNav";
import { MobileMenu } from "../Components/Viewer/MobileMenu";
import { MobileFaction } from "../Components/Viewer/MobileFaction";
import { MobileFactionUnits } from "../Components/Viewer/MobileFactionUnits";
import { MobileWelcome } from "../Components/Viewer/MobileWelcome";
import { MobileSharingMenu } from "../Components/Viewer/MobileSharingMenu";
import { MobileGameSystemSelector } from "../Components/Viewer/MobileGameSystemSelector";
import { MobileGameSystemSettings } from "../Components/Viewer/MobileGameSystemSettings";
import {
  MobileAoSFaction,
  MobileAoSFactionUnits,
  MobileAoSManifestationLores,
  MobileAoSSpellLores,
} from "../Components/Viewer/AoS";
import { ListAdd } from "../Components/Viewer/ListCreator/ListAdd";
import { MobileListProvider } from "../Components/Viewer/useMobileList";
import { PWAInstallPrompt } from "../Components/Viewer/Mobile/PWAInstallPrompt";
import { MobileAccountSheet, MobileAccountSettingsSheet, MobileSyncSheet } from "../Premium";

import { Warhammer40K10eCardDisplay } from "../Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";
import { AgeOfSigmarCardDisplay } from "../Components/AgeOfSigmar/CardDisplay";

import { useCardStorage } from "../Hooks/useCardStorage";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { useViewerNavigation } from "../Hooks/useViewerNavigation";
import { useMobileSharing } from "../Hooks/useMobileSharing";
import { useRecentSearches } from "../Hooks/useRecentSearches";
import { useScrollRevealHeader } from "../Hooks/useScrollRevealHeader";

const { Content } = Layout;
const { useBreakpoint } = Grid;

export const ViewerMobile = ({ showUnits = false, showManifestationLores = false, showSpellLores = false }) => {
  const [parent] = useAutoAnimate({ duration: 75 });
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const { dataSource, selectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  // Get last selected faction from settings (even when not currently viewing it)
  const getFactionIndex = () => {
    if (typeof settings.selectedFactionIndex === "object") {
      return settings.selectedFactionIndex?.[settings.selectedDataSource] ?? 0;
    }
    return settings.selectedFactionIndex ?? 0;
  };
  const lastFaction = dataSource?.data?.[getFactionIndex()];

  // Check if user has explicitly selected a faction for current datasource
  const hasFactionSelected =
    typeof settings.hasFactionSelected === "object"
      ? (settings.hasFactionSelected?.[settings.selectedDataSource] ?? false)
      : false;
  const { activeCard } = useCardStorage();
  const { shareLink, htmlToImageConvert } = useMobileSharing();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();

  // Initialize navigation hook to sync URL with state
  useViewerNavigation();

  // Check if we're in AoS mode
  const isAoS = settings.selectedDataSource === "aos";

  // Scroll-reveal header for AoS only
  const { showHeader, headerReady, scrollContainerRef } = useScrollRevealHeader({
    enabled: !!activeCard && activeCard.source === "aos",
    targetSelector: ".warscroll-unit-name",
    topOffset: 64,
  });

  // Handle back navigation from card viewer
  const handleBackFromCard = () => {
    navigate(-1);
  };

  // UI State
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [isListAddVisible, setIsListAddVisible] = useState(false);
  const [isMobileSharingMenuVisible, setIsMobileSharingMenuVisible] = useState(false);
  const [isAccountSheetVisible, setIsAccountSheetVisible] = useState(false);
  const [isAccountSettingsVisible, setIsAccountSettingsVisible] = useState(false);
  const [isSyncSheetVisible, setIsSyncSheetVisible] = useState(false);

  // Search State
  const [searchText, setSearchText] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showFactionSelector, setShowFactionSelector] = useState(false);

  // Refs for sharing
  const fullCardRef = useRef(null);
  const viewerCardRef = useRef(null);
  const overlayRef = useRef(null);

  // State for pending game system (shows settings screen before finalizing)
  const [pendingGameSystem, setPendingGameSystem] = useState(null);

  // Handle game system selection
  const handleGameSystemSelect = (system) => {
    if (system === "aos") {
      // Show settings screen for AoS before finalizing
      setPendingGameSystem(system);
    } else {
      // For other systems, proceed directly
      updateSettings({
        ...settings,
        selectedDataSource: system,
        showCardsAsDoubleSided: true,
        mobile: {
          ...settings.mobile,
          gameSystemSelected: true,
        },
      });
    }
  };

  // Handle continuing from settings screen
  const handleSettingsContinue = () => {
    const systemToSet = pendingGameSystem;
    setPendingGameSystem(null); // Clear first to prevent re-render loop
    updateSettings({
      ...settings,
      selectedDataSource: systemToSet,
      showCardsAsDoubleSided: true,
      mobile: {
        ...settings.mobile,
        gameSystemSelected: true,
      },
    });
  };

  // Check if game system has been selected
  const gameSystemSelected = settings.mobile?.gameSystemSelected;

  // If pending game system, show settings screen
  if (pendingGameSystem) {
    return <MobileGameSystemSettings gameSystem={pendingGameSystem} onContinue={handleSettingsContinue} />;
  }

  // If no game system selected, show selector
  if (!gameSystemSelected) {
    return <MobileGameSystemSelector onSelect={handleGameSystemSelect} />;
  }

  // Get faction colors
  const cardFaction = dataSource?.data?.find((faction) => faction.id === activeCard?.faction_id);

  // Render card based on source
  const renderCard = (type) => {
    if (!activeCard) return null;

    switch (activeCard.source) {
      case "40k-10e":
        return <Warhammer40K10eCardDisplay type={type} />;
      case "40k":
        return <Warhammer40KCardDisplay />;
      case "basic":
        return <Warhammer40KCardDisplay />;
      case "necromunda":
        return <NecromundaCardDisplay />;
      case "aos":
        return <AgeOfSigmarCardDisplay type={type} onBack={type === "viewer" ? handleBackFromCard : undefined} />;
      default:
        return null;
    }
  };

  // Handle search focus/blur
  const handleSearchFocus = () => {
    setShowSearchDropdown(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => {
      // Only close if search is empty
      if (!searchText) {
        setShowSearchDropdown(false);
      }
    }, 200);
  };

  const handleCloseDropdown = () => {
    setShowSearchDropdown(false);
    setSearchText("");
  };

  // Handle selecting a unit from search
  const handleSelectUnit = (unit) => {
    addRecentSearch(unit, unit.factionName, unit.factionId);
    setSearchText("");
    setShowSearchDropdown(false);
  };

  return (
    <MobileListProvider>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Search Header */}
        <MobileSearchHeader
          searchText={searchText}
          setSearchText={setSearchText}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onFactionSelectorClick={() => setShowFactionSelector(true)}
          showDropdown={showSearchDropdown}
        />

        {/* Search Dropdown */}
        <MobileSearchDropdown
          isOpen={showSearchDropdown}
          onClose={handleCloseDropdown}
          searchText={searchText}
          onSelectUnit={handleSelectUnit}
        />

        {/* Faction Selector */}
        <MobileSearchFactionFilter isOpen={showFactionSelector} onClose={() => setShowFactionSelector(false)} />

        <Content style={{ marginTop: "64px", height: "calc(100vh - 64px)", paddingBottom: "54px" }}>
          {/* Overlay for sharing screenshots */}
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

          <Row>
            <Col ref={parent} span={24}>
              {/* AoS: Sticky header (visible after scroll, only render after ready) */}
              {activeCard && isAoS && headerReady && (
                <div
                  className={`mobile-card-header mobile-card-header-scroll mobile-card-header-aos ${
                    showHeader ? "visible" : "hidden"
                  }`}
                  style={{
                    "--banner-colour": cardFaction?.colours?.banner,
                    "--header-colour": cardFaction?.colours?.header,
                  }}>
                  <button className="mobile-card-back" onClick={handleBackFromCard} type="button">
                    <ArrowLeft size={20} />
                  </button>
                  <h1 className="mobile-card-title">{activeCard.name}</h1>
                </div>
              )}

              <div
                ref={scrollContainerRef}
                style={{
                  height: "calc(100vh - 64px)",
                  display: "block",
                  overflow: "auto",
                  "--banner-colour": cardFaction?.colours?.banner,
                  "--header-colour": cardFaction?.colours?.header,
                  backgroundColor: "#d8d8da",
                  paddingBottom: "64px",
                }}
                className={`data-${activeCard?.source}`}>
                {/* Back button header for non-AoS cards (original sticky behavior) */}
                {activeCard && !isAoS && (
                  <div className="mobile-card-header">
                    <button className="mobile-card-back" onClick={handleBackFromCard} type="button">
                      <ArrowLeft size={20} />
                    </button>
                    <h1 className="mobile-card-title">{activeCard.name}</h1>
                  </div>
                )}
                <Row style={{ overflow: "hidden" }}>{renderCard("viewer")}</Row>
                {!activeCard && !selectedFaction && !showUnits && (
                  <MobileWelcome
                    recentSearches={recentSearches}
                    onClearRecent={clearRecentSearches}
                    lastFaction={lastFaction}
                    hasFactionSelected={hasFactionSelected}
                    onBrowseFactions={() => setShowFactionSelector(true)}
                  />
                )}
                {/* eslint-disable-next-line prettier/prettier */}
                {!activeCard &&
                  selectedFaction &&
                  !showUnits &&
                  !showManifestationLores &&
                  !showSpellLores &&
                  (isAoS ? <MobileAoSFaction /> : <MobileFaction />)}
                {showUnits && (isAoS ? <MobileAoSFactionUnits /> : <MobileFactionUnits />)}
                {showManifestationLores && isAoS && <MobileAoSManifestationLores />}
                {showSpellLores && isAoS && <MobileAoSSpellLores />}
              </div>

              <MobileNav
                setMenuVisible={setIsMobileMenuVisible}
                setSharingVisible={setIsMobileSharingMenuVisible}
                setAddListvisible={setIsListAddVisible}
                setAccountVisible={setIsAccountSheetVisible}
              />

              <PWAInstallPrompt />
              <ListAdd isVisible={isListAddVisible} setIsVisible={setIsListAddVisible} />
              <MobileMenu isVisible={isMobileMenuVisible} setIsVisible={setIsMobileMenuVisible} />
              <MobileAccountSheet
                isVisible={isAccountSheetVisible}
                setIsVisible={setIsAccountSheetVisible}
                onOpenSync={() => {
                  setIsAccountSheetVisible(false);
                  setIsSyncSheetVisible(true);
                }}
                onOpenAccountSettings={() => {
                  setIsAccountSheetVisible(false);
                  setIsAccountSettingsVisible(true);
                }}
              />
              <MobileAccountSettingsSheet
                isVisible={isAccountSettingsVisible}
                setIsVisible={setIsAccountSettingsVisible}
              />
              <MobileSyncSheet isVisible={isSyncSheetVisible} setIsVisible={setIsSyncSheetVisible} />
              <MobileSharingMenu
                isVisible={isMobileSharingMenuVisible}
                setIsVisible={setIsMobileSharingMenuVisible}
                shareFullCard={() => htmlToImageConvert(fullCardRef, overlayRef)}
                shareMobileCard={() => htmlToImageConvert(viewerCardRef, overlayRef)}
                shareLink={() => shareLink()}
              />
            </Col>
          </Row>

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
            <Row style={{ overflow: "hidden" }}>{renderCard()}</Row>
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
            <Row style={{ overflow: "hidden" }}>{renderCard("viewer")}</Row>
          </div>
        </Content>
      </Layout>
    </MobileListProvider>
  );
};
