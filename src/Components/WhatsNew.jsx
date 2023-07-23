import { Button, Col, Image, Row, Typography } from "antd";
import { compare } from "compare-versions";
import React, { useEffect } from "react";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";
import rosterizer from "../svg/rosterizer.svg";

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
                          You can now edit the back of the cards while in the Desktop card editor. Since &nbsp;
                          <strong>Leads</strong> and <strong>Lead by</strong> are derrived fields they are not editable
                          at the moment.
                        </li>
                        <li>
                          <strong>Legends cards</strong>
                          <br />A first pass has been added for Legends cards for 10th edition. Please note that for now
                          only the &quot;main&quot; faction of the cards have them available. The Traitoris versions
                          will be coming at a later date.
                        </li>
                        <li>
                          <strong>Allied & Parent factions</strong>
                          <br />
                          You can add Allied & Parent factions to faction that have available. They will show up at the
                          bottom of the datasheet list.
                        </li>
                        <li>
                          <strong>Group by role</strong>
                          <br />
                          Datasheets can now be grouped by role for listbuilding.
                        </li>
                        <li>
                          <strong>More settings</strong>
                          <br />A couple of settings and filters have been added. Check them out in the Faction settings
                          and the mobile options menu.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Friends from the website</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>
                            <Image src={rosterizer} preview={false} style={{ height: "45px" }} />
                          </strong>
                          <br />
                          Our friends @ <a href="https://rosterizer.com/">Rosterizer</a> have been working hard on full
                          10th edition support and have launched a kickstarter. Take a peek:{" "}
                          <a href="https://www.kickstarter.com/projects/gameknave/rosterizer-a-universal-list-builder-app-for-tabletop-games">
                            Kickstarter
                          </a>
                          .
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
