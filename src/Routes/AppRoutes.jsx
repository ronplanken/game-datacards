import * as React from "react";
import { Route, Routes } from "react-router-dom";
import App from "../App";
// import { Embed } from "../Pages/Embed";
import { ImageExport } from "../Pages/ImageExport";
import { ImageGenerator } from "../Pages/ImageGenerator";
import { LegacyPrint } from "../Pages/LegacyPrint";
import { Print } from "../Pages/Print";
import { Shared } from "../Pages/Shared";
import { Viewer } from "../Pages/Viewer";

const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={isMobile ? <Viewer /> : <App />} />
      <Route path="shared/:Id" element={<Shared />} />
      <Route path="viewer/:faction?/:unit?" element={<Viewer />} />
      <Route path="viewer/:faction?/stratagem/:stratagem?" element={<Viewer />} />
      <Route path="viewer/:faction?/allied/:alliedFaction?/:alliedUnit?" element={<Viewer />} />
      {/* <Route path="embed/:faction?/:unit?" element={<Embed />} /> */}
      <Route path="print/:CategoryId" element={<Print />} />
      <Route path="legacy-print/:CategoryId" element={<LegacyPrint />} />
      <Route path="image-generator" element={<ImageGenerator />} />
      <Route path="image-export/:CategoryId" element={<ImageExport />} />
    </Routes>
  );
};
