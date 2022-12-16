import * as React from "react";
import { Routes, Route } from "react-router-dom";
import App from "../App";
import { Shared } from "../Pages/Shared";
import Mobile from "../Mobile";
import { Print } from "../Pages/Print";

const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={isMobile ? <Mobile /> : <App />} />
      <Route path="shared/:Id" element={<Shared />} />
      <Route path="print" element={<Print />} />
    </Routes>
  );
};
