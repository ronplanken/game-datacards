import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import App from "../App";
// import { Embed } from "../Pages/Embed";
import { ImageExport } from "../Pages/ImageExport";
import { ImageGenerator } from "../Pages/ImageGenerator";
import { LegacyPrint } from "../Pages/LegacyPrint";
import { Print } from "../Pages/Print";
import { Shared } from "../Pages/Shared";
import { Viewer } from "../Pages/Viewer";
import { ViewerMobile } from "../Pages/ViewerMobile";

const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root route - redirect based on device */}
      <Route path="/" element={isMobile ? <Navigate to="/mobile" replace /> : <App />} />

      {/* Shared card view */}
      <Route path="shared/:Id" element={<Shared />} />

      {/* Desktop viewer routes */}
      <Route path="viewer/:faction?/:unit?" element={<Viewer />} />
      <Route path="viewer/:faction?/stratagem/:stratagem?" element={<Viewer />} />
      <Route path="viewer/:faction?/allied/:alliedFaction?/:alliedUnit?" element={<Viewer />} />

      {/* Mobile viewer routes */}
      <Route path="mobile" element={<ViewerMobile />} />
      <Route path="mobile/:faction/units" element={<ViewerMobile showUnits />} />
      <Route path="mobile/:faction?/:unit?" element={<ViewerMobile />} />
      <Route path="mobile/:faction?/stratagem/:stratagem?" element={<ViewerMobile />} />
      <Route path="mobile/:faction?/allied/:alliedFaction?/:alliedUnit?" element={<ViewerMobile />} />

      {/* Print and export routes */}
      {/* <Route path="embed/:faction?/:unit?" element={<Embed />} /> */}
      <Route path="print/:CategoryId" element={<Print />} />
      <Route path="legacy-print/:CategoryId" element={<LegacyPrint />} />
      <Route path="image-generator" element={<ImageGenerator />} />
      <Route path="image-export/:CategoryId" element={<ImageExport />} />
    </Routes>
  );
};
