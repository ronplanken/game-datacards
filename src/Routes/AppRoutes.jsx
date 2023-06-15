import * as React from "react";
import { Route, Routes } from "react-router-dom";
import App from "../App";
import Mobile from "../Mobile";
import { LegacyPrint } from "../Pages/LegacyPrint";
import { Print } from "../Pages/Print";
import { Shared } from "../Pages/Shared";
import { Viewer } from "../Pages/Viewer";

const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={isMobile ? <Mobile /> : <App />} />
      <Route path="shared/:Id" element={<Shared />} />
      <Route path="viewer" element={<Viewer />} />
      <Route path="print/:CategoryId" element={<Print />} />
      <Route path="legacy-print/:CategoryId" element={<LegacyPrint />} />
    </Routes>
  );
};
