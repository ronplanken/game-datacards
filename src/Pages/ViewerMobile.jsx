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
import { ListAdd } from "../Components/Viewer/ListCreator/ListAdd";
import { MobileListProvider } from "../Components/Viewer/useMobileList";

import { Warhammer40K10eCardDisplay } from "../Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";

import { useCardStorage } from "../Hooks/useCardStorage";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { useViewerNavigation } from "../Hooks/useViewerNavigation";
import { useMobileSharing } from "../Hooks/useMobileSharing";
import { useRecentSearches } from "../Hooks/useRecentSearches";

const { Content } = Layout;
const { useBreakpoint } = Grid;

export const ViewerMobile = ({ showUnits = false }) => {
  const [parent] = useAutoAnimate({ duration: 75 });
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const { dataSource, selectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  // Get last selected faction from settings (even when not currently viewing it)
  const lastFaction = dataSource?.data?.[settings.selectedFactionIndex];
  const { activeCard } = useCardStorage();
  const { shareLink, htmlToImageConvert } = useMobileSharing();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();

  // Initialize navigation hook to sync URL with state
  useViewerNavigation();

  // Handle back navigation from card viewer
  const handleBackFromCard = () => {
    navigate(-1);
  };

  // UI State
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [isListAddVisible, setIsListAddVisible] = useState(false);
  const [isMobileSharingMenuVisible, setIsMobileSharingMenuVisible] = useState(false);

  // Search State
  const [searchText, setSearchText] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showFactionSelector, setShowFactionSelector] = useState(false);

  // Refs for sharing
  const fullCardRef = useRef(null);
  const viewerCardRef = useRef(null);
  const overlayRef = useRef(null);

  // Set data source to 40k-10e on mount and force full card display
  useEffect(() => {
    updateSettings({
      ...settings,
      selectedDataSource: "40k-10e",
      showCardsAsDoubleSided: true,
    });
  }, []);

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
              <div
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
                {/* Back button header when viewing a card */}
                {activeCard && (
                  <div className="mobile-card-header">
                    <button className="mobile-card-back" onClick={handleBackFromCard}>
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
                  />
                )}
                {!activeCard && selectedFaction && !showUnits && <MobileFaction />}
                {showUnits && <MobileFactionUnits />}
              </div>

              <MobileNav
                setMenuVisible={setIsMobileMenuVisible}
                setSharingVisible={setIsMobileSharingMenuVisible}
                setAddListvisible={setIsListAddVisible}
              />

              <ListAdd isVisible={isListAddVisible} setIsVisible={setIsListAddVisible} />
              <MobileMenu isVisible={isMobileMenuVisible} setIsVisible={setIsMobileMenuVisible} />
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
