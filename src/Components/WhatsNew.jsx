import { Button, Col, Row, Typography } from "antd";
import { compare } from "compare-versions";
import React, { useEffect } from "react";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { AddCard } from "../Icons/AddCard";
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
                Whats new in 2.1.0
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
                          <strong>Mobile List Creation</strong>
                          <br />
                          When using the mobile version you can now create a list on the go. Simply open up a DataCard
                          and press the new button <AddCard /> at the bottom, select a size, warlord and optional
                          enhancement and add it to your list. <br /> <br /> The button on the left&nbsp;
                          <Button
                            type="ghost"
                            size="small"
                            className="button-bar"
                            shape="round"
                            style={{ color: "white", backgroundColor: "rgb(0, 21, 41)" }}>
                            0 pts
                          </Button>
                          &nbsp; will show the amount of points and gives you an overview. You can also export it to
                          text through the list overview.
                        </li>
                        <li>
                          <strong>Stratagem & Enhancement overview</strong>
                          <br />
                          You can now select an Faction in the top header. Doing this will show an overview of faction
                          stratagems and enhancements. Pressing the GDC logo will always let you return here. <br />
                          <br /> An extra special thanks to ZiggyQubert for working on the Stratagem datasource!
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
