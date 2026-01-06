import React, { useState, useCallback, useEffect } from "react";
import * as ReactDOM from "react-dom";
import { LogOut, Settings, User } from "lucide-react";
import { useUser } from "../../Hooks/useUser";
import "./UserMenu.css";

const modalRoot = document.getElementById("modal-root");

export const UserMenu = ({ onSettingsClick }) => {
  const { user, isLoggedIn, logout } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const avatarRef = React.useRef(null);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Handle click outside to close dropdown
  const handleClickOutside = useCallback(
    (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    },
    [avatarRef]
  );

  // Handle escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen, handleClickOutside, handleKeyDown]);

  const toggleDropdown = () => {
    if (!isDropdownOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  // Logged out state - show Sign In button
  if (!isLoggedIn) {
    return (
      <button className="user-menu-signin-btn" onClick={() => {}}>
        <User size={16} />
        <span>Sign In</span>
      </button>
    );
  }

  // Logged in state - show avatar with dropdown
  return (
    <>
      <div ref={avatarRef} className="user-menu-avatar" onClick={toggleDropdown}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="user-menu-avatar-img" />
        ) : (
          <span className="user-menu-avatar-initials">{getInitials(user.name)}</span>
        )}
      </div>

      {isDropdownOpen &&
        ReactDOM.createPortal(
          <div
            className="user-menu-dropdown"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
            }}>
            <div className="user-menu-dropdown-header">
              <div className="user-menu-dropdown-name">{user.name}</div>
              <div className="user-menu-dropdown-email">{user.email}</div>
            </div>
            <div className="user-menu-dropdown-divider" />
            <div className="user-menu-dropdown-item" onClick={handleSettingsClick}>
              <Settings size={16} />
              <span>Settings</span>
            </div>
            <div className="user-menu-dropdown-item user-menu-dropdown-item-danger" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </div>
          </div>,
          modalRoot
        )}
    </>
  );
};
