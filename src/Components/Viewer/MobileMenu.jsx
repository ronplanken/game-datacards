import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Database, Loader2, Repeat, User } from "lucide-react";
import { message } from "../Toast/message";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useAuth } from "../../Premium";
import { getMessages } from "../../Helpers/external.helpers";
import { resolveMobileConfig } from "./mobileDatasourceConfig";
import { BottomSheet } from "./Mobile/BottomSheet";
import { MobileNotifications } from "./MobileNotifications";
import "./MobileMenu.css";

// Settings row component (exported for settings section components)
const SettingsRow = ({ label, checked, onChange }) => (
  <div className="settings-row">
    <span className="settings-label">{label}</span>
    <button className={`settings-toggle ${checked ? "active" : ""}`} onClick={() => onChange(!checked)}>
      <span className="settings-toggle-thumb" />
    </button>
  </div>
);

export const MobileMenu = ({ isVisible, setIsVisible }) => {
  const navigate = useNavigate();
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const { dataSource, checkForUpdate } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const { user } = useAuth();

  const config = resolveMobileConfig(settings.selectedDataSource, dataSource);

  // Fetch messages for unread count
  useEffect(() => {
    getMessages().then((data) => {
      if (data) setMessages(data.messages || []);
    });
  }, []);

  const unreadCount = messages.filter((m) => m.id > settings.serviceMessage).length;

  const handleClose = () => setIsVisible(false);

  const handleUpdateDatasources = () => {
    setCheckingForUpdate(true);
    checkForUpdate().then(() => {
      setCheckingForUpdate(false);
      handleClose();
      message.success({
        content: "Game data updated",
        style: { marginTop: "10vh" },
      });
    });
  };

  const handleChangeGameSystem = () => {
    updateSettings({
      ...settings,
      mobile: {
        ...settings.mobile,
        gameSystemSelected: false,
      },
    });
    handleClose();
  };

  const handleOpenNotifications = () => {
    handleClose();
    setNotificationsOpen(true);
  };

  const notificationButton = (
    <button className="settings-header-icon-btn" onClick={handleOpenNotifications}>
      <Bell size={20} />
      {unreadCount > 0 && <span className="settings-header-badge">{unreadCount}</span>}
    </button>
  );

  return (
    <>
      <BottomSheet isOpen={isVisible} onClose={handleClose} title="Settings" headerRight={notificationButton}>
        <div className="settings-content">
          {/* Game System Section */}
          <div className="settings-section">
            <h4 className="settings-section-title">Game System</h4>
            <div className="settings-game-system">
              <span className="settings-game-system-current">{config.label}</span>
              <button className="settings-action-button secondary" onClick={handleChangeGameSystem}>
                <Repeat size={18} />
                <span>Switch</span>
              </button>
            </div>
          </div>

          {/* Game-system-specific settings section */}
          {config.SettingsSection && <config.SettingsSection settings={settings} updateSettings={updateSettings} />}

          {/* Card Types Section */}
          <div className="settings-section">
            <h4 className="settings-section-title">Card Types</h4>
            <div className="settings-section-content">
              <SettingsRow
                label="Show Legend cards"
                checked={settings.showLegends}
                onChange={(value) => updateSettings({ ...settings, showLegends: value })}
              />
            </div>
          </div>

          {/* Actions Section */}
          <div className="settings-section">
            <h4 className="settings-section-title">Updates</h4>
            <button
              className={`settings-action-button ${checkingForUpdate ? "loading" : ""}`}
              onClick={handleUpdateDatasources}
              disabled={checkingForUpdate}>
              {checkingForUpdate ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
              <span>{checkingForUpdate ? "Checking..." : "Check for updates"}</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      <MobileNotifications isVisible={notificationsOpen} setIsVisible={setNotificationsOpen} />
    </>
  );
};
