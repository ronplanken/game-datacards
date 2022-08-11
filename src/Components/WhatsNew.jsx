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
                Whats new in 1.3.1
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
                          <strong>Added a Markdown editor to all textfields.</strong>
                          <br />
                          All textarea&apos;s have been replaced with a simple Markdown editor. This is in preparation to add a table that certain texts might have.
                        </li>
                        <li>
                          <strong>Note option added to Necromunda cards</strong>
                          <br />
                          Fighter &amp; Vehicle cards now have a <strong>Note</strong> section where you can write down stuff you want to remember but don&apos;t need to print on a card. Please note that this will also be shared when sharing your category.
                        </li>
                        <li>
                          <strong>Drag &amp; Drop</strong>
                          <br />
                          All card types now have the ability to drag &amp; drop lines / cards in the card editor.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Necromunda:</strong> Renamed the <strong>Gang card</strong> to <strong>Fighter card</strong> to better represent what kind of card it is.
                        </li>
                        <li>
                          <strong>Necromunda:</strong> Renamed the <strong>Empty Type Card</strong> to <strong>Type Card (for pen &amp; paper)</strong> to better represent what their purpose is.
                        </li>
                        <li>
                          <strong>Necromunda:</strong> Wargear, rules and abilities are now textfields and are no longer uppercased. You have full control over the text in this field.
                        </li>
                        <li>
                          <strong>40K:</strong> Newly added cards with multiple damage tables now have a proper title.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Necromunda:</strong> Adding a new weapon to a card will no longer crash the app.
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
