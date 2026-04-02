import React, { useEffect, useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Col, Grid, Layout, Row } from "antd";
import { ArrowLeft, Pencil } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "antd/dist/antd.min.css";
import "../App.css";
import "../style.less";
import "../mobile.less";

import { MobileSearchHeader } from "../Components/Viewer/MobileSearchHeader";
import { MobileSearchDropdown } from "../Components/Viewer/MobileSearchDropdown";
import { MobileSearchFactionFilter } from "../Components/Viewer/MobileSearchFactionFilter";
import { MobileNav } from "../Components/Viewer/MobileNav";
import { MobileMenu } from "../Components/Viewer/MobileMenu";
import { MobileWelcome } from "../Components/Viewer/MobileWelcome";
import { MobileSharingMenu } from "../Components/Viewer/MobileSharingMenu";
import { MobileGameSystemSelector } from "../Components/Viewer/MobileGameSystemSelector";
import { MobileGameSystemSettings } from "../Components/Viewer/MobileGameSystemSettings";
import { resolveMobileConfig } from "../Components/Viewer/mobileDatasourceConfig";
import { ListAdd } from "../Components/Viewer/ListCreator/ListAdd";
import { MobileListProvider, useMobileList } from "../Components/Viewer/useMobileList";
import { PWAInstallPrompt } from "../Components/Viewer/Mobile/PWAInstallPrompt";
import { MobileCardEditor } from "../Components/Viewer/MobileEditor";
import { MobileAccountSheet, MobileAccountSettingsSheet, MobileSyncSheet } from "../Premium";

const MobileSharedListsModal = React.lazy(() =>
  import("../Premium").then((mod) => ({ default: mod.MobileSharedListsModal })),
);

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

  const { dataSource, selectedFaction, getCustomDatasourceData } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();
  // Resolve config for current datasource
  const config = resolveMobileConfig(settings.selectedDataSource, dataSource);

  // Get last selected faction from settings (even when not currently viewing it)
  const getFactionIndex = () => {
    if (typeof settings.selectedFactionIndex === "object") {
      const idx = settings.selectedFactionIndex?.[settings.selectedDataSource] ?? 0;
      return idx >= 0 ? idx : 0;
    }
    const idx = settings.selectedFactionIndex ?? 0;
    return idx >= 0 ? idx : 0;
  };
  const lastFaction = dataSource?.data?.[getFactionIndex()];

  // Check if user has explicitly selected a faction for current datasource
  const hasFactionSelected =
    typeof settings.hasFactionSelected === "object"
      ? (settings.hasFactionSelected?.[settings.selectedDataSource] ?? false)
      : false;
  // Load live banner colours for custom/subscribed datasources from localForage
  const [datasourceColours, setDatasourceColours] = useState({});
  useEffect(() => {
    const loadColours = async () => {
      const entries = settings.customDatasources || [];
      if (entries.length === 0) return;

      const colours = {};
      for (const entry of entries) {
        const data = await getCustomDatasourceData(entry.id);
        if (data) {
          colours[entry.id] = data.schema?.colours?.banner || data.data?.[0]?.colours?.banner || null;
        }
      }
      setDatasourceColours(colours);
    };
    loadColours();
  }, [settings.customDatasources, getCustomDatasourceData]);

  // Always force double-sided cards on mobile (no swap button exists)
  useEffect(() => {
    if (settings.showCardsAsDoubleSided !== true) {
      updateSettings({ ...settings, showCardsAsDoubleSided: true });
    }
  }, [settings.showCardsAsDoubleSided]);

  const { activeCard, updateActiveCard } = useCardStorage();
  const { shareLink, htmlToImageConvert } = useMobileSharing();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  const location = useLocation();

  // Detect if card came from a list or cloud category (for edit button)
  const listCard = location.state?.listCard;
  const cloudCard = location.state?.cloudCard;
  const editableCard = listCard || cloudCard;
  const isEditableCard = !!editableCard;

  // Load custom datasource schema for the editor (only when editing a custom DS card)
  const [editorSchema, setEditorSchema] = useState(null);
  useEffect(() => {
    if (!isEditableCard || !activeCard?.source) {
      setEditorSchema(null);
      return;
    }
    // Built-in systems don't need a schema
    const builtIn = ["40k-10e", "40k", "aos", "necromunda", "basic"];
    if (builtIn.includes(activeCard.source)) {
      setEditorSchema(null);
      return;
    }
    // Load schema from localForage for custom datasources
    getCustomDatasourceData(activeCard.source).then((data) => {
      setEditorSchema(data?.schema || null);
    });
  }, [isEditableCard, activeCard?.source, getCustomDatasourceData]);

  // Initialize navigation hook to sync URL with state
  useViewerNavigation();

  // Scroll-reveal header (config-driven)
  const { showHeader, headerReady, scrollContainerRef } = useScrollRevealHeader({
    enabled: !!activeCard && config.useScrollRevealHeader,
    targetSelector: config.scrollRevealTargetSelector,
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
  const [isMobileSharedListsVisible, setIsMobileSharedListsVisible] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

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
    // Check if this system has a settings screen (e.g. AoS)
    const selectedConfig = resolveMobileConfig(system, dataSource);
    if (selectedConfig.GameSystemSettingsScreen) {
      setPendingGameSystem(system);
    } else {
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
    const customDatasources = settings.customDatasources || [];
    const subscribedDatasources = customDatasources.filter((ds) => ds.isSubscribed);
    return (
      <MobileGameSystemSelector
        onSelect={handleGameSystemSelect}
        customDatasources={customDatasources}
        subscribedDatasources={subscribedDatasources}
        datasourceColours={datasourceColours}
      />
    );
  }

  // Get faction colors
  const cardFaction = dataSource?.data?.find((faction) => faction.id === activeCard?.faction_id);

  // Check which extra route views are active
  const activeExtraView = config.extraRouteViews.find((view) => {
    if (view.prop === "showManifestationLores") return showManifestationLores;
    if (view.prop === "showSpellLores") return showSpellLores;
    return false;
  });

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
              {/* Scroll-reveal header (config-driven) */}
              {activeCard && config.useScrollRevealHeader && headerReady && (
                <>
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
                    {isEditableCard && (
                      <button className="mobile-card-edit" onClick={() => setIsEditorOpen(true)} type="button">
                        <Pencil size={18} />
                      </button>
                    )}
                  </div>
                  {/* Floating edit button - visible before scroll-reveal header appears */}
                  {isEditableCard && !showHeader && (
                    <button className="mobile-card-edit-floating" onClick={() => setIsEditorOpen(true)} type="button">
                      <Pencil size={20} />
                    </button>
                  )}
                </>
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
                className={config.cssClass}>
                {/* Back button header for non-scroll-reveal cards */}
                {activeCard && !config.useScrollRevealHeader && (
                  <div className="mobile-card-header">
                    <button className="mobile-card-back" onClick={handleBackFromCard} type="button">
                      <ArrowLeft size={20} />
                    </button>
                    <h1 className="mobile-card-title">{activeCard.name}</h1>
                    {isEditableCard && (
                      <button className="mobile-card-edit" onClick={() => setIsEditorOpen(true)} type="button">
                        <Pencil size={18} />
                      </button>
                    )}
                  </div>
                )}
                <Row style={{ overflow: "hidden" }}>
                  <React.Suspense fallback={null}>
                    {config.renderCard("viewer", { onBack: handleBackFromCard })}
                  </React.Suspense>
                </Row>
                {!activeCard && !selectedFaction && !showUnits && (
                  <MobileWelcome
                    recentSearches={recentSearches}
                    onClearRecent={clearRecentSearches}
                    lastFaction={lastFaction}
                    hasFactionSelected={hasFactionSelected}
                    onBrowseFactions={() => setShowFactionSelector(true)}
                  />
                )}
                {/* Faction overview */}
                {/* eslint-disable-next-line prettier/prettier */}
                {!activeCard && selectedFaction && !showUnits && !activeExtraView && (
                  <React.Suspense fallback={null}>
                    <config.FactionComponent />
                  </React.Suspense>
                )}
                {/* Units list */}
                {showUnits && (
                  <React.Suspense fallback={null}>
                    <config.FactionUnitsComponent />
                  </React.Suspense>
                )}
                {/* Extra route views (manifestation lores, spell lores, etc.) */}
                {activeExtraView && <activeExtraView.Component />}
              </div>

              <MobileNav
                setMenuVisible={setIsMobileMenuVisible}
                setSharingVisible={setIsMobileSharingMenuVisible}
                setAddListvisible={setIsListAddVisible}
                setAccountVisible={setIsAccountSheetVisible}
              />

              <PWAInstallPrompt />
              <ListAdd isVisible={isListAddVisible} setIsVisible={setIsListAddVisible} />
              <MobileCardEditor
                isOpen={isEditorOpen}
                onClose={(updatedCard) => {
                  setIsEditorOpen(false);
                  if (updatedCard) {
                    updateActiveCard(updatedCard, true);
                    // Build URL from updated name so useViewerNavigation can match it
                    const factionSlug = cardFaction?.name?.toLowerCase().replaceAll(" ", "-");
                    const cardSlug = updatedCard.name?.toLowerCase().replaceAll(" ", "-");
                    const newPath = factionSlug && cardSlug ? `/mobile/${factionSlug}/${cardSlug}` : location.pathname;
                    const stateKey = listCard ? "listCard" : "cloudCard";
                    navigate(newPath, { replace: true, state: { [stateKey]: updatedCard } });
                  }
                }}
                card={activeCard}
                cardUuid={editableCard?.uuid}
                gameSystem={settings.selectedDataSource}
                factionColours={cardFaction?.colours}
                schema={editorSchema}
              />
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
                onOpenSharedLists={() => {
                  setIsAccountSheetVisible(false);
                  setIsMobileSharedListsVisible(true);
                }}
              />
              <MobileAccountSettingsSheet
                isVisible={isAccountSettingsVisible}
                setIsVisible={setIsAccountSettingsVisible}
              />
              <MobileSyncSheet isVisible={isSyncSheetVisible} setIsVisible={setIsSyncSheetVisible} />
              <React.Suspense fallback={null}>
                <MobileSharedListsModal
                  visible={isMobileSharedListsVisible}
                  onCancel={() => setIsMobileSharedListsVisible(false)}
                />
              </React.Suspense>
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
            className={config.cssClass}>
            <Row style={{ overflow: "hidden" }}>
              <React.Suspense fallback={null}>{config.renderCard()}</React.Suspense>
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
            className={config.cssClass}>
            <Row style={{ overflow: "hidden" }}>
              <React.Suspense fallback={null}>
                {config.renderCard("viewer", { onBack: handleBackFromCard })}
              </React.Suspense>
            </Row>
          </div>
        </Content>
      </Layout>
    </MobileListProvider>
  );
};
