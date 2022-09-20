import { Button, Col, Row, Typography } from "antd";
import { compare } from "compare-versions";
import React, { useEffect } from "react";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";

export const WhatsNew = () => {
  const [isWhatsNewVisible, setIsWhatsNewVisible] = React.useState(false);

  const { settings, updateSettings } = useSettingsStorage();

  const closeWhatsNew = () => {
    setIsWhatsNewVisible(false);
    updateSettings({
      ...settings,
      wizardCompleted: process.env.REACT_APP_VERSION,
    });
  };

  useEffect(() => {
    if (
      compare(settings.wizardCompleted, LAST_WIZARD_VERSION, ">=") &&
      compare(settings.wizardCompleted, process.env.REACT_APP_VERSION, "<")
    ) {
      setIsWhatsNewVisible(true);
    }
  }, [settings]);

  return (
    <>
      {isWhatsNewVisible && (
        <div className="welcome-background">
          <div className="whatsnew-container">
            <div
              style={{
                backgroundColor: "#001529",
                width: "100%",
                height: "90px",
                textAlign: "center",
              }}>
              <h1
                style={{
                  height: "100%",
                  lineHeight: "90px",
                  fontSize: "32px",
                  color: "white",
                }}>
                Whats new in 1.4.1
              </h1>
            </div>
            <div className="welcome-cover">
              <>
                <Row style={{ padding: "16px" }}>
                  <Col>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Full support for Wahapedia&apos;s Psychic Powers.</strong>
                          <br />
                          Game-datacards.eu now has full support for all Psychic abilities that are available in the
                          Wahapedia datasource.
                          <em>Please note that you need to update your datasources in order to use the latest data.</em>
                        </li>
                        <li>
                          <strong>Datasheets can now show a header</strong>
                          <br />
                          Using the new settings button on a datasheet you can toggle the header on/off.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Col>
                </Row>
                <Row
                  style={{
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    position: "absolute",
                    bottom: "16px",
                    width: "100%",
                  }}
                  justify={"space-between"}>
                  <Col></Col>
                  <Col>
                    <Button type="primary" size="large" onClick={() => closeWhatsNew()}>
                      Close
                    </Button>
                  </Col>
                  <Col></Col>
                </Row>
              </>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
