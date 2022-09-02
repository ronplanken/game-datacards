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
                Whats new in 1.4.0
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
                          <strong>Full support for Wahapedia&apos;s secondaries &amp; subfactions.</strong>
                          <br />
                          Game-datacards.eu now has full support for all secondaries &amp; subfactions that are
                          available in the Wahapedia datasource.{" "}
                          <em>Please note that you need to update your datasources in order to use the latest data.</em>
                        </li>
                        <li>
                          <strong>Filter stratagems &amp; secondaries on subfaction</strong>
                          <br />
                          You can now select which subfactions you want to show for the stratagems &amp; secondaries
                          using the new button next to the faction select. By default all subfactions are shown.
                        </li>
                        <li>
                          <strong>Update reminder</strong>
                          <br />
                          An update reminder has been added to remind you to check for datasource updates.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>40K</strong> Secondaries now have full table support if the text has them.
                        </li>
                        <li>
                          <strong>40K</strong> Changes have been made to certain faction id fields. This might cause
                          some backgrounds not working, if this occurs you can manually select a new background /
                          faction.
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
