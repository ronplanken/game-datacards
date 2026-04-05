import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "../../Components/AppHeader";
import { HelpSidebar } from "./components/HelpSidebar";
import "./Help.css";

export const HelpLayout = () => {
  return (
    <>
      <AppHeader showActions={false} pageTitle="Help" />
      <div className="help-layout">
        <HelpSidebar />
        <Outlet />
      </div>
    </>
  );
};
