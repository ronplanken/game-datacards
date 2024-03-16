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
                Whats new in 2.5.0
              </h1>
            </div>
            <div className="welcome-cover">
              <>
                <Row style={{ padding: "16px" }} className="whatsnew-content">
                  <Col>
                    <Typography.Title level={5}>Updates</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Dark Angels update</strong>
                          <br />
                          The new Dark Angels 10e codex has been added to the website.
                        </li>
                        <li>
                          <strong>Chaos Space Marines</strong>
                          <br />
                          The CSM stratagems have been updated to comply with the latest index.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Markdown</strong>
                          <br />
                          Markdown has been re-enabled for most description fields. Please note that some options are
                          not fully compatible yet. (Such as newlines)
                        </li>
                        <li>
                          <strong>Invulnerable save display</strong>
                          <br />
                          The invulnerable save is now displayed at the top of the unit card. Old datasheets still
                          default to the old location. Updated ones are by default displayed at the top.
                        </li>
                        <li>
                          <strong>Combined weapon profiles</strong>
                          <br />
                          Weapons that have exclusive profiles (such as sweep & strike for melee) now have the maker to
                          show they are exclusive.
                        </li>
                        <li>
                          <strong>Weapon abilities</strong>
                          <br />
                          Weapon abilities (such as one-shot) can now be edited and added.
                        </li>
                        <li>
                          <strong>Image Generator</strong>
                          <br />A Image Generator has been added to the website. This allows you to create images of
                          complete factions. This is an experimental feature and can be found{" "}
                          <a href="/image-generator">here</a>.
                        </li>
                        <li>
                          <strong>Various fixes</strong>
                          <br />
                          Various fixes and improvements have been made to the website.
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
