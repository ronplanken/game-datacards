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
                Whats new in 2.6.0
              </h1>
            </div>
            <div className="welcome-cover">
              <>
                <Row style={{ padding: "16px" }} className="whatsnew-content">
                  <Col>
                    <Typography.Title level={5}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Full sized cards display</strong>
                          <br />
                          Finally! The technology has arrived to display Warhammer 10e cards in a single full sized card
                          side. This is a feature that has been requested for a long time and is finally here. You can
                          toggle the feature per card (as a Variant) or globally in the settings.
                          <br />
                          The settings option can be found next to the faction selection dropdown on desktop and in the
                          settings menu on mobile. Please note this overrides any options regarding the back & front
                          options of a card.
                        </li>
                        <li>
                          <strong>Complete and thorough cleanup of datasources</strong>
                          <br />
                          We have set all our servitors to work and managed to automate the error checking and cleanup
                          of our datasources. This means we are now able to provide a more consistent and reliable
                          experience with your datacards!
                          <br />
                          During this setup we also changed all cards to default to the invulnerable save at the top of
                          the card. Your old cards are unfortunately not updated to this new standard and need a manual
                          update or create a new duplicate card.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Known issues</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Printing full sized cards</strong>
                          <br />
                          Unfortunately the full sized cards currently do not play nice with other cards while printing.
                          This means when you try to print multiple cards on a page they might take up more space then
                          you wish. You can still print them, but min/maxing the page might be tricky. We are working on
                          a fix and will keep you updated.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Social</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>We need your help!</strong>
                          <br />
                          Please report any issues you find to the Discord or join us to chat about new and upcoming
                          features!
                        </li>
                      </ul>
                      <Row style={{ padding: "16px" }} justify={"center"}>
                        <Col span={24} style={{ textAlign: "center" }}>
                          <a href="https://discord.gg/anfn4qTYC4" target={"_blank"} rel="noreferrer">
                            <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2"></img>
                          </a>
                        </Col>
                      </Row>
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
