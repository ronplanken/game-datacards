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
                Whats new in 1.3.0
              </h1>
            </div>
            <div className="welcome-cover">
              <>
                <Row style={{ padding: "16px" }}>
                  <Col>
                    <Typography.Paragraph style={{ fontSize: "20px" }}>
                      Welcome to version 1.3.0. We have changed and added several things, please take a look at the
                      changelog. As always, any idea&apos;s or suggestions can be discussed in our Discord! The focus for
                      this release has been to add Necromunda cards as a datasource and add Warhammer 40k secondaries.
                    </Typography.Paragraph>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Added basic Necromunda card support.</strong>
                          <br />
                          A ganger and a vehicle card (empty and/or editable) are now available. You can use these cards by switching to the Necromunda Datasource.
                        </li>
                        <li>
                          <strong>Added Warhammer 40k secondary support. </strong>
                          <br />
                          When the datasource has secondaries enabled you can find them in the dropdown select list in
                          the card viewer. <i>Be sure to check for datasource updates.</i>
                        </li>
                        <li>
                          <strong>Window to show changes for a new version. </strong>
                          <br />
                          The panel are you are currently looking at 😅
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Datasources:</strong> Some changes have been made to the stored cards format. If you
                          experience any issues please let us know on Discord.
                        </li>
                        <li>
                          <strong>Icons:</strong> Changed the icons based on the card type.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Warhammer 40K:</strong> The card editor icons are no longer missing.
                        </li>
                        <li>
                          <strong>Warhammer 40K:</strong> Added proper Grenade &amp; Dakka icons
                        </li>
                        <li>
                          <strong>Warhammer 40K:</strong> You can now toggle the unit composition on/off
                        </li>
                        <li>
                          <strong>Basic:</strong> Basic Stratagem and Secondary now actually show up when selected.
                        </li>
                        <li>
                          <strong>All:</strong> Cleaned up the styling and added print + share support for all types of cards.
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
