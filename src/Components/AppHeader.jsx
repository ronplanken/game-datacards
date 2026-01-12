import { Badge, Grid, Image, Layout } from "antd";
import { Tooltip } from "./Tooltip/Tooltip";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Globe } from "lucide-react";

import { useCardStorage } from "../Hooks/useCardStorage";
import { useAuth, usePremiumFeatures, AccountButton, SyncStatusIndicator, DatasourceUpdateBadge } from "../Premium";
import { Discord } from "../Icons/Discord";
import logo from "../Images/logo.png";
import { DatasourceSelector } from "./DatasourceSelector";
import { NotificationBell } from "./NotificationBell";
import { SettingsModal } from "./SettingsModal";
import { ShareModal } from "./ShareModal";
import { DatasourceBrowserModal } from "./DatasourceBrowser";
import { WhatsNew } from "./WhatsNew";
import "./AppHeader.css";

const { Header } = Layout;
const { useBreakpoint } = Grid;

export const AppHeader = ({
  showModals = true,
  pageTitle = null,
  showNav = true,
  showActions = true,
  className = "",
}) => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { hasDatasourceBrowser } = usePremiumFeatures();

  const { activeCategory } = useCardStorage();
  const [showBrowseModal, setShowBrowseModal] = useState(false);

  const isEditorPage = location.pathname === "/" || location.pathname === "";
  const isViewerPage = location.pathname.startsWith("/viewer");

  return (
    <>
      {showModals && <WhatsNew />}
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
              </nav>
            )}
          </div>

          {/* Right section - Actions and User */}
          <div className="app-header-right">
            {showActions && screens.md && <DatasourceSelector />}
            {showActions && activeCategory && activeCategory.cards?.length > 0 && <ShareModal />}

            {showActions && <NotificationBell />}

            {showActions && <SyncStatusIndicator />}

            {showActions && user && <DatasourceUpdateBadge />}

            {showActions && hasDatasourceBrowser && (
              <Tooltip content="Browse Community Datasources" placement="bottom-end">
                <button className="app-header-icon-btn" onClick={() => setShowBrowseModal(true)}>
                  <Globe size={18} />
                </button>
              </Tooltip>
            )}

            {showActions && (
              <Tooltip content="Join us on discord!" placement="bottom-end">
                <button
                  className="app-header-icon-btn"
                  onClick={() => window.open("https://discord.gg/anfn4qTYC4", "_blank")}>
                  <Discord />
                </button>
              </Tooltip>
            )}

            <SettingsModal />

            <AccountButton />
          </div>
        </div>
      </Header>

      {/* Browse Datasources Modal - Premium only */}
      {hasDatasourceBrowser && (
        <DatasourceBrowserModal isOpen={showBrowseModal} onClose={() => setShowBrowseModal(false)} />
      )}
    </>
  );
};
