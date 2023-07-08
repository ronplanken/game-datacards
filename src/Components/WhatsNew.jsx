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
                Whats new in 2.1.1
              </h1>
            </div>
            <div className="welcome-cover">
              <>
                <Row style={{ padding: "16px" }} className="whatsnew-content">
                  <Col>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Backcard editing</strong>
                          <br />
                          You can now edit the back of the cards while in the Desktop card editor. Since
                          <strong>Leads</strong> and <strong>Lead by</strong> are derrived fields they are not editable
                          at the moment.
                        </li>
                        <li>
                          <strong>Legends cards</strong>
                          <br />A first pass has been added for Legends cards for 10th edition. Please note that for now
                          only the &quot;main&quot; faction of the cards have them available. The Traitoris versions
                          will be coming at a later date. On both Mobile and Desktop they are hidden by default but can
                          be enabled through the faction settings or mobile settings.
                          <br />
                          <br />
                          <b>Make sure to update your datasources!</b>
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Bug fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Background colours</strong>
                          <br />
                          You can select a low-ink print option for 40k 10e cards.
                        </li>
                        <li>
                          <strong>Swapping front to back save message</strong>
                          <br />
                          When swapping between front & back on the desktop version GDC will not bother you with a
                          &quot;unsaved changes&quot; popup anymore.
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
