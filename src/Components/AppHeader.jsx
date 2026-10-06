import { Badge, Grid, Image, Layout } from "antd";
import { Tooltip } from "./Tooltip/Tooltip";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Globe, HelpCircle } from "lucide-react";

import { useCardStorage } from "../Hooks/useCardStorage";
import {
  useAuth,
  usePremiumFeatures,
  useAdmin,
  AccountButton,
  SyncStatusIndicator,
  DatasourceUpdateBadge,
  CommunityBrowserModal,
  PremiumUpgradeButton,
} from "../Premium";
import { useFeatureFlags } from "../Hooks/useFeatureFlags";
import { Discord } from "../Icons/Discord";
import logo from "../Images/logo.png";
import { DatasourceSelector } from "./DatasourceSelector";
import { NotificationBell } from "./NotificationBell";
import { SettingsModal } from "./SettingsModal";
import { ShareModal } from "./ShareModal";
import "./AppHeader.css";

const { Header } = Layout;
const { useBreakpoint } = Grid;

export const AppHeader = ({
  pageTitle = null,
  showNav = true,
  showActions = true,
  showSyncStatus = null, // null means follow showActions, true/false to override
  className = "",
}) => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { hasDatasourceBrowser } = usePremiumFeatures();
  const { isAdmin } = useAdmin();
  const { designerEnabled, communityBrowserEnabled, adminEnabled } = useFeatureFlags();

  const { activeCategory } = useCardStorage();
  const [showBrowseModal, setShowBrowseModal] = useState(false);

  const isEditorPage = location.pathname === "/" || location.pathname === "";
  const isViewerPage = location.pathname.startsWith("/viewer");
  const isDesignerPage = location.pathname.startsWith("/designer");
  const isDatasourcesPage = location.pathname.startsWith("/datasources");
  const isAdminPage = location.pathname.startsWith("/admin");

  // Designer and Datasources pages should show all header actions like the Editor does
  const effectiveShowActions = showActions || isDesignerPage || isDatasourcesPage;

  return (
    <>
      <Header className={`app-header ${className}`}>
        <div className="app-header-content">
          {/* Left section - Logo and Navigation */}
          <div className="app-header-left">
            <div className="app-header-brand" onClick={() => navigate("/")}>
              {import.meta.env.VITE_IS_PRODUCTION === "false" ? (
                <Badge.Ribbon color="red" text={import.meta.env.VITE_ENVIRONMENT}>
                  <Image preview={false} src={logo} width={50} />
                </Badge.Ribbon>
              ) : (
                <Image preview={false} src={logo} width={50} />
              )}
              {screens.md && <span className="app-header-title">Game Datacards</span>}
            </div>
            {pageTitle && screens.md && <span className="app-header-page-title">{pageTitle}</span>}

            {showNav && screens.sm && (
              <nav className="app-header-nav">
                <Link to="/" className={`app-header-nav-item ${isEditorPage ? "active" : ""}`}>
                  Editor
                </Link>
                <Link to="/viewer" className={`app-header-nav-item ${isViewerPage ? "active" : ""}`}>
                  Viewer
                </Link>
                <Link to="/datasources" className={`app-header-nav-item ${isDatasourcesPage ? "active" : ""}`}>
                  Datasources
                  <span className="app-header-beta-badge">beta</span>
                </Link>
                {designerEnabled && isAuthenticated && (
                  <Link to="/designer" className={`app-header-nav-item ${isDesignerPage ? "active" : ""}`}>
                    Designer
                    <span className="app-header-beta-badge">beta</span>
                  </Link>
                )}
                {designerEnabled && !isAuthenticated && (
                  <Tooltip content="Log in to use the Designer" placement="bottom">
                    <span className="app-header-nav-item app-header-nav-item--disabled">
                      Designer
                      <span className="app-header-beta-badge">beta</span>
                    </span>
                  </Tooltip>
                )}
                {adminEnabled && isAdmin && (
                  <Link to="/admin" className={`app-header-nav-item ${isAdminPage ? "active" : ""}`}>
                    Admin
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right section - Actions and User */}
          <div className="app-header-right">
            {/* Workflow group: Datasource + Share */}
            {effectiveShowActions && screens.md && (
              <>
                <div className="app-header-group">
                  <PremiumUpgradeButton />
                  <DatasourceSelector />
                  {activeCategory && activeCategory.cards?.length > 0 && <ShareModal />}
                </div>
                <span className="app-header-separator" />
              </>
            )}

            {/* Status group: Bell + Sync + Updates */}
            <div className="app-header-group">
              {effectiveShowActions && <NotificationBell />}
              {(showSyncStatus ?? effectiveShowActions) && <SyncStatusIndicator />}
              {effectiveShowActions && user && <DatasourceUpdateBadge />}
            </div>

            {/* Designer help button - only on designer page */}
            {isDesignerPage && (
              <>
                <span className="app-header-separator" />
                <div className="app-header-group">
                  <Tooltip content="Open Designer Docs" placement="bottom-end">
                    <button
                      className="app-header-icon-btn"
                      aria-label="Open Designer Docs"
                      onClick={() => navigate("/help/card-designer/getting-started")}>
                      <HelpCircle size={18} />
                    </button>
                  </Tooltip>
                </div>
              </>
            )}

            {/* Datasource help button - only on datasources page */}
            {isDatasourcesPage && (
              <>
                <span className="app-header-separator" />
                <div className="app-header-group">
                  <Tooltip content="Open Datasource Docs" placement="bottom-end">
                    <button
                      className="app-header-icon-btn"
                      aria-label="Open Datasource Docs"
                      onClick={() => navigate("/help/datasource-editor/getting-started")}>
                      <HelpCircle size={18} />
                    </button>
                  </Tooltip>
                </div>
              </>
            )}

            <span className="app-header-separator" />

            {/* Social group: Community + Discord */}
            <div className="app-header-group">
              {effectiveShowActions && hasDatasourceBrowser && communityBrowserEnabled && (
                <Tooltip content="Browse Community" placement="bottom-end">
                  <button
                    className="app-header-icon-btn app-header-social-btn"
                    onClick={() => setShowBrowseModal(true)}>
                    <Globe size={18} />
                  </button>
                </Tooltip>
              )}

              {effectiveShowActions && (
                <Tooltip content="Join us on discord!" placement="bottom-end">
                  <button
                    className="app-header-icon-btn app-header-social-btn"
                    onClick={() => window.open("https://discord.gg/anfn4qTYC4", "_blank")}>
                    <Discord />
                  </button>
                </Tooltip>
              )}
            </div>

            <span className="app-header-separator" />

            {/* User group: Settings + Account */}
            <div className="app-header-group">
              <SettingsModal />
              <AccountButton />
            </div>
          </div>
        </div>
      </Header>

      {/* Browse Community Modal - Premium only (datasources + templates) */}
      {hasDatasourceBrowser && communityBrowserEnabled && (
        <CommunityBrowserModal isOpen={showBrowseModal} onClose={() => setShowBrowseModal(false)} />
      )}
    </>
  );
};
