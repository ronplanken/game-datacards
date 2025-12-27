import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import { createBrowserRouter, RouterProvider, ScrollRestoration, Outlet, Navigate } from "react-router-dom";
import { CardStorageProviderComponent } from "./Hooks/useCardStorage";
import { DataSourceStorageProviderComponent } from "./Hooks/useDataSourceStorage";
import { FirebaseProviderComponent } from "./Hooks/useFirebase";
import { SettingsStorageProviderComponent } from "./Hooks/useSettingsStorage";
import { UserProviderComponent } from "./Hooks/useUser";

import App from "./App";
import { ImageExport } from "./Pages/ImageExport";
import { ImageGenerator } from "./Pages/ImageGenerator";
import { LegacyPrint } from "./Pages/LegacyPrint";
import { Print } from "./Pages/Print";
import { Shared } from "./Pages/Shared";
import { Viewer } from "./Pages/Viewer";
import { ViewerMobile } from "./Pages/ViewerMobile";

import { Col, Grid, Result, Row, Typography } from "antd";
import { ErrorBoundary } from "react-error-boundary";
import { MobileListProvider } from "./Components/Viewer/useMobileList";

const { Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

function ErrorFallback({ error }) {
  const screens = useBreakpoint();

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Result
        status="error"
        title="Sorry, something went wrong."
        subTitle={error.message}
        style={{ width: screens.xs ? "100%" : "50%" }}>
        <div className="desc">
          <Paragraph>
            <Row style={{ padding: "16px" }} justify={"center"}>
              <Col span={16}>
                <Text
                  strong
                  style={{
                    fontSize: 16,
                  }}>
                  Please refresh the page and try again. If you keep receiving this error let us know on Discord.
                </Text>
              </Col>
            </Row>
          </Paragraph>
          <Paragraph>
            <Row style={{ padding: "16px" }} justify={"center"}>
              <Col span={16}>
                <Paragraph ellipsis={{ rows: 1, expandable: true, symbol: "more" }}>{error.stack}</Paragraph>
              </Col>
            </Row>
          </Paragraph>
          <Paragraph>
            <Row style={{ padding: "4px", textAlign: "center" }} justify={"center"}>
              <Col span={24}>
                <a href="https://discord.gg/anfn4qTYC4" target={"_blank"} rel="noreferrer">
                  <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2"></img>
                </a>
              </Col>
            </Row>
          </Paragraph>
        </div>
      </Result>
    </div>
  );
}

// Layout component that wraps all routes with providers
const RootLayout = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <SettingsStorageProviderComponent>
      <UserProviderComponent>
        <FirebaseProviderComponent>
          <DataSourceStorageProviderComponent>
            <CardStorageProviderComponent>
              <MobileListProvider>
                <Outlet />
                <ScrollRestoration />
              </MobileListProvider>
            </CardStorageProviderComponent>
          </DataSourceStorageProviderComponent>
        </FirebaseProviderComponent>
      </UserProviderComponent>
    </SettingsStorageProviderComponent>
  </ErrorBoundary>
);

const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Root route - redirect based on device
      { path: "/", element: isMobile ? <Navigate to="/mobile" replace /> : <App /> },
      // Shared card view
      { path: "shared/:Id", element: <Shared /> },
      // Desktop viewer routes
      { path: "viewer/:faction/manifestation-lores", element: <Viewer showManifestationLores /> },
      { path: "viewer/:faction/manifestation-lore/:spell", element: <Viewer /> },
      { path: "viewer/:faction/spell-lores", element: <Viewer showSpellLores /> },
      { path: "viewer/:faction/spell-lore/:spell", element: <Viewer /> },
      { path: "viewer/:faction?/:unit?", element: <Viewer /> },
      { path: "viewer/:faction?/stratagem/:stratagem?", element: <Viewer /> },
      { path: "viewer/:faction?/allied/:alliedFaction?/:alliedUnit?", element: <Viewer /> },
      // Mobile viewer routes
      { path: "mobile", element: <ViewerMobile /> },
      { path: "mobile/:faction/units", element: <ViewerMobile showUnits /> },
      { path: "mobile/:faction/manifestation-lores", element: <ViewerMobile showManifestationLores /> },
      { path: "mobile/:faction/manifestation-lore/:spell", element: <ViewerMobile /> },
      { path: "mobile/:faction/spell-lores", element: <ViewerMobile showSpellLores /> },
      { path: "mobile/:faction/spell-lore/:spell", element: <ViewerMobile /> },
      { path: "mobile/:faction?/:unit?", element: <ViewerMobile /> },
      { path: "mobile/:faction?/stratagem/:stratagem?", element: <ViewerMobile /> },
      { path: "mobile/:faction?/allied/:alliedFaction?/:alliedUnit?", element: <ViewerMobile /> },
      // Print and export routes
      { path: "print/:CategoryId", element: <Print /> },
      { path: "legacy-print/:CategoryId", element: <LegacyPrint /> },
      { path: "image-generator", element: <ImageGenerator /> },
      { path: "image-export/:CategoryId", element: <ImageExport /> },
    ],
  },
]);

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<RouterProvider router={router} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register service worker for PWA functionality (mobile only)
if ("serviceWorker" in navigator && isMobile) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service Worker registration failed
    });
  });
}
