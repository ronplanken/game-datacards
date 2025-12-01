import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter } from "react-router-dom";
import { CardStorageProviderComponent } from "./Hooks/useCardStorage";
import { DataSourceStorageProviderComponent } from "./Hooks/useDataSourceStorage";
import { FirebaseProviderComponent } from "./Hooks/useFirebase";
import { SettingsStorageProviderComponent } from "./Hooks/useSettingsStorage";
import { UserProviderComponent } from "./Hooks/useUser";
import { AppRoutes } from "./Routes/AppRoutes";

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

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <SettingsStorageProviderComponent>
      <UserProviderComponent>
        <FirebaseProviderComponent>
          <DataSourceStorageProviderComponent>
            <CardStorageProviderComponent>
              <MobileListProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </MobileListProvider>
            </CardStorageProviderComponent>
          </DataSourceStorageProviderComponent>
        </FirebaseProviderComponent>
      </UserProviderComponent>
    </SettingsStorageProviderComponent>
  </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
