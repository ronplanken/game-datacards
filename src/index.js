import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./Routes/AppRoutes";
import { CardStorageProviderComponent } from "./Hooks/useCardStorage";
import { FirebaseProviderComponent } from "./Hooks/useFirebase";
import { SettingsStorageProviderComponent } from "./Hooks/useSettingsStorage";
import { DataSourceStorageProviderComponent } from "./Hooks/useDataSourceStorage";

import { CloseCircleOutlined } from "@ant-design/icons";

import { ErrorBoundary } from "react-error-boundary";
import { Col, Result, Row, Typography } from "antd";

const { Paragraph, Text } = Typography;

function ErrorFallback({ error }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Result status="error" title="Sorry, something went wrong." subTitle={error.message} style={{ width: "50%" }}>
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
            <Row style={{ padding: "16px", textAlign: "center" }} justify={"center"}>
              <Col span={10}>
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

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SettingsStorageProviderComponent>
        <FirebaseProviderComponent>
          <DataSourceStorageProviderComponent>
            <CardStorageProviderComponent>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </CardStorageProviderComponent>
          </DataSourceStorageProviderComponent>
        </FirebaseProviderComponent>
      </SettingsStorageProviderComponent>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
