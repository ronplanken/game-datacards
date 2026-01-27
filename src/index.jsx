import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
  Outlet,
  Navigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  AuthProvider,
  SubscriptionProvider,
  SyncProvider,
  CloudCategoriesProvider,
  CheckoutSuccessModal,
  SyncConflictHandler,
  MobileLoginPage,
  MobileSignupPage,
  MobilePasswordResetPage,
  MobileTwoFactorPage,
  useProducts,
  DesignerPage,
  usePremiumFeatures,
  TemplateStorageProvider,
} from "./Premium";
import { CardStorageProviderComponent } from "./Hooks/useCardStorage";
import { DataSourceStorageProviderComponent } from "./Hooks/useDataSourceStorage";
import { DatasourceSharingProvider } from "./Hooks/useDatasourceSharing";
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
import { WelcomeWizard } from "./Components/WelcomeWizard";
import { MobileWelcomeWizard } from "./Components/MobileWelcomeWizard";
import { WhatsNewWizard } from "./Components/WhatsNewWizard";
import { MobileWhatsNewWizard } from "./Components/MobileWhatsNewWizard";
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

// Component to select wizard based on current route
const WizardSelector = () => {
  const location = useLocation();
  const isMobileRoute = location.pathname.startsWith("/mobile");

  return isMobileRoute ? <MobileWelcomeWizard /> : <WelcomeWizard />;
};

// Component to select What's New wizard based on current route
const WhatsNewWizardSelector = () => {
  const location = useLocation();
  const isMobileRoute = location.pathname.startsWith("/mobile");

  return isMobileRoute ? <MobileWhatsNewWizard /> : <WhatsNewWizard />;
};

// Conditional Designer route - only renders if premium feature is available
const DesignerRoute = () => {
  const { hasCardDesigner } = usePremiumFeatures();
  return hasCardDesigner ? <DesignerPage /> : null;
};

// Component to handle checkout success redirect
// Creem redirects with: checkout_id, order_id, customer_id, subscription_id, product_id, signature
const CheckoutSuccessHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [tier, setTier] = React.useState("premium");
  const [pendingProductId, setPendingProductId] = React.useState(null);
  const { products, loading, getTierByProductId } = useProducts();

  // Step 1: Detect checkout params and store product_id, then clean URL
  React.useEffect(() => {
    const checkoutId = searchParams.get("checkout_id");
    const productId = searchParams.get("product_id");

    if (checkoutId) {
      // Store product_id for tier lookup once products load
      setPendingProductId(productId);

      // Remove Creem query parameters from URL without refresh
      searchParams.delete("checkout_id");
      searchParams.delete("order_id");
      searchParams.delete("customer_id");
      searchParams.delete("subscription_id");
      searchParams.delete("product_id");
      searchParams.delete("signature");
      // Also clean up legacy params if present
      searchParams.delete("checkout");
      searchParams.delete("tier");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Step 2: Once products are loaded, determine tier and show modal
  React.useEffect(() => {
    if (pendingProductId && !loading) {
      // Try dynamic lookup first (supports multiple product IDs per tier)
      let detectedTier = getTierByProductId(pendingProductId);

      // Fallback to static env vars if products failed to load
      if (!detectedTier && !products) {
        const creatorProductId = import.meta.env.VITE_CREEM_PRODUCT_ID_CREATOR;
        detectedTier = pendingProductId === creatorProductId ? "creator" : "premium";
      }

      setTier(detectedTier || "premium");
      setShowSuccess(true);
      setPendingProductId(null); // Clear pending state
    }
  }, [pendingProductId, loading, products, getTierByProductId]);

  return <CheckoutSuccessModal visible={showSuccess} onClose={() => setShowSuccess(false)} tier={tier} />;
};

// Layout component that wraps all routes with providers
const RootLayout = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <SettingsStorageProviderComponent>
      <AuthProvider>
        <SubscriptionProvider>
          <UserProviderComponent>
            <FirebaseProviderComponent>
              <DataSourceStorageProviderComponent>
                <DatasourceSharingProvider>
                  <CardStorageProviderComponent>
                    <TemplateStorageProvider>
                      <SyncProvider>
                        <CloudCategoriesProvider>
                          <MobileListProvider>
                            <Outlet />
                            <ScrollRestoration />
                            <WizardSelector />
                            <WhatsNewWizardSelector />
                            <CheckoutSuccessHandler />
                            <SyncConflictHandler />
                          </MobileListProvider>
                        </CloudCategoriesProvider>
                      </SyncProvider>
                    </TemplateStorageProvider>
                  </CardStorageProviderComponent>
                </DatasourceSharingProvider>
              </DataSourceStorageProviderComponent>
            </FirebaseProviderComponent>
          </UserProviderComponent>
        </SubscriptionProvider>
      </AuthProvider>
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
      // Designer route (premium only)
      { path: "designer", element: <DesignerRoute /> },
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
      // Mobile auth routes
      { path: "mobile/login", element: <MobileLoginPage /> },
      { path: "mobile/signup", element: <MobileSignupPage /> },
      { path: "mobile/forgot-password", element: <MobilePasswordResetPage /> },
      { path: "mobile/verify-2fa", element: <MobileTwoFactorPage /> },
      // Mobile viewer routes
      { path: "mobile", element: <ViewerMobile /> },
      { path: "mobile/:faction/units", element: <ViewerMobile showUnits /> },
      { path: "mobile/:faction/manifestation-lores", element: <ViewerMobile showManifestationLores /> },
      { path: "mobile/:faction/manifestation-lore/:spell", element: <ViewerMobile /> },
      { path: "mobile/:faction/spell-lores", element: <ViewerMobile showSpellLores /> },
      { path: "mobile/:faction/spell-lore/:spell", element: <ViewerMobile /> },
      { path: "mobile/:faction/enhancement/:enhancement", element: <ViewerMobile /> },
      { path: "mobile/:faction/rule/:rule", element: <ViewerMobile /> },
      { path: "mobile/:faction/stratagem/:stratagem", element: <ViewerMobile /> },
      { path: "mobile/:faction/allied/:alliedFaction/:alliedUnit?", element: <ViewerMobile /> },
      { path: "mobile/:faction?/:unit?", element: <ViewerMobile /> },
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
