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
                Whats new in 2.10.0
              </h1>
            </div>
            <div className="welcome-cover">
              <>
                <Row style={{ padding: "16px" }} className="whatsnew-content">
                  <Col>
                    <Typography.Title level={4}>Added</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Added external image option for 10e Unit Cards</strong>
                          <br />
                          Based on our previous update, we added the option to add an external image to your 10e cards.
                          This image has to be hosted on an external website and have a direct link to the image. You
                          can add this image in the card editor.
                        </li>
                        <li>
                          <strong>Text Size option for 10e Stratagem Cards</strong>
                          <br />
                          You can now manually set the text size for your stratagem cards. This is useful if you want to
                          make sure the text fits on the card.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={4}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Unsaved changes popup</strong>
                          <br />
                          We have changed the logic when the unsaved changes popup is shown. It will now give you the
                          option to immediately save your changes and continue or cancel the action.
                        </li>
                        <li>
                          <strong>10e Stratagem Card type</strong>
                          <br />
                          The text size of a Stratagem Card&apos;s type will now auto scale based on the available
                          space.
                        </li>
                        <li>
                          <strong>Agents of the Imperium</strong>
                          <br />
                          Agents of the Imperium are now correctly displayed in the list of factions.
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
