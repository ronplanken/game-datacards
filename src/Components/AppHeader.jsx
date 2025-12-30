import { Badge, Grid, Image, Layout } from "antd";
import { Tooltip } from "./Tooltip/Tooltip";
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useCardStorage } from "../Hooks/useCardStorage";
import { Discord } from "../Icons/Discord";
import logo from "../Images/logo.png";
import { NotificationBell } from "./NotificationBell";
import { SettingsModal } from "./SettingsModal";
import { ShareModal } from "./ShareModal";
import { UpdateReminder } from "./UpdateReminder";
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

  const { activeCategory } = useCardStorage();

  const isEditorPage = location.pathname === "/" || location.pathname === "";
  const isViewerPage = location.pathname.startsWith("/viewer");

  return (
    <>
      {showModals && (
        <>
          <WhatsNew />
          <UpdateReminder />
        </>
      )}
      <Header className={`app-header ${className}`}>
        <div className="app-header-content">
          {/* Left section - Logo and Navigation */}
          <div className="app-header-left">
            <div className="app-header-brand" onClick={() => navigate("/")}>
              {process.env.REACT_APP_IS_PRODUCTION === "false" ? (
                <Badge.Ribbon color="red" text={process.env.REACT_APP_ENVIRONMENT}>
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
            {showActions && activeCategory && activeCategory.cards?.length > 0 && <ShareModal />}

            {showActions && <NotificationBell />}

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

            {/* User menu - hidden for now, will be implemented with auth later */}
            {/* <UserMenu onSettingsClick={() => {}} /> */}
          </div>
        </div>
      </Header>
    </>
  );
};
