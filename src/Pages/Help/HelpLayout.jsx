import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { AppHeader } from "../../Components/AppHeader";
import { HelpSidebar } from "./components/HelpSidebar";
import "./Help.css";

export const HelpLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <AppHeader showActions={false} pageTitle="Help" />
      <div className="help-layout">
        <button className="help-mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <HelpSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Outlet />
      </div>
    </>
  );
};
