import { Alert, Button, Card, Col, Image, Row, Steps, Switch, Typography } from "antd";
import { compare } from "compare-versions";
import React, { useEffect } from "react";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import wizard01 from "../Images/wizard01.png";
import wizard02 from "../Images/wizard02.png";
import wizard03 from "../Images/wizard03.png";
import wizard04 from "../Images/wizard04.png";
import wizard05 from "../Images/wizard05.png";
import wizard06 from "../Images/wizard06.png";

const { Step } = Steps;

export const LAST_WIZARD_VERSION = "1.2.0";

export const WelcomeWizard = () => {
  const [isWizardVisible, setIsWizardVisible] = React.useState(false);
  const [step, setStep] = React.useState(0);

  const { settings, updateSettings } = useSettingsStorage();

  const endWizard = () => {
    setIsWizardVisible(false);
    setStep(0);
    updateSettings({
      ...settings,
      wizardCompleted: process.env.REACT_APP_VERSION,
    });
  };

  useEffect(() => {
    if (compare(settings.wizardCompleted, LAST_WIZARD_VERSION, "<")) {
      setIsWizardVisible(true);
    }
  }, [settings]);

  return (
    <>
      {isWizardVisible && (
        <div className="welcome-background">
          <div className="welcome-container">
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
                {step === 0 && "Welcome"}
                {step === 1 && "Managing Cards"}
                {step === 2 && "Adding Cards"}
                {step === 3 && "Editing Cards"}
                {step === 4 && "Sharing Cards"}
                {step === 5 && "Datasources"}
                {step === 6 && "Thank you"}
              </h1>
            </div>
            <div className="welcome-cover">
              {step === 0 && (
                <>
                  <Row style={{ padding: "16px" }}>
                    <Col>
                      <Typography.Paragraph style={{ fontSize: "18px" }}>
                        Welcome to Game Datacards. <i>The</i> website where you can create and manage your own datacards
                        for any wargaming tabletop gaming system.
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ fontSize: "18px" }}>
                        In order to get you started with our web app we would like to introduce you to the app and have
                        you setup any datasources you would like to use.
                      </Typography.Paragraph>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      paddingLeft: "16px",
                      paddingRight: "16px",
                      position: "absolute",
                      bottom: "92px",
                      width: "100%",
                    }}
                    justify={"space-between"}>
                    <Col></Col>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(1)}>
                        Lets get started!
                      </Button>
                    </Col>
                    <Col></Col>
                  </Row>
                </>
              )}
              {step === 1 && (
                <>
                  <Row style={{ padding: "16px" }}>
                    <Col span={12}>
                      <Typography.Paragraph style={{ fontSize: "15px" }}>
                        Game Datacards is setup in a way that allows you to add cards to a category and customize them.
                        On the left of the app you have the treeview where you can see your current category and any
                        cards that are added to the category.
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ fontSize: "15px" }}>
                        You can drag &amp; drop cards to re-order and optionally place them in a different category.
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ fontSize: "15px" }}>
                        Right-clicking on a card or category will give you even more options.
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ fontSize: "15px" }}>
                        Selecting a card or a category in the list with a left-click will open up the Export, Print and
                        Sharing options.
                      </Typography.Paragraph>
                    </Col>
                    <Col span={10} push={1}>
                      <Image src={wizard01}></Image>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      paddingLeft: "16px",
                      paddingRight: "16px",
                      position: "absolute",
                      bottom: "92px",
                      width: "100%",
                    }}
                    justify={"space-between"}>
                    <Col></Col>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(2)}>
                        Next
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
              {step === 2 && (
                <>
                  <Row style={{ padding: "16px" }}>
                    <Col span={10}>
                      <Image src={wizard02}></Image>
                    </Col>
                    <Col span={12} push={1}>
                      <Typography.Paragraph style={{ fontSize: "15px" }}>
                        On the bottom left you have the card explorer. Depending on the datasource selected you can
                        switch factions and search for a specific card by name.
                      </Typography.Paragraph>
                    </Col>
                  </Row>
                  <Row style={{ padding: "16px" }}>
                    <Col span={14}>
                      <Typography.Paragraph style={{ fontSize: "15px" }}>
                        Selecting a card in the card explorer will show the card in the preview window in the middle of
                        the screen. You can edit it using the options on the right, but changes will only be saved if
                        you add it to your category.
                      </Typography.Paragraph>
                    </Col>
                    <Col span={8} push={1} style={{ marginTop: "-75px" }}>
                      <Image src={wizard03} height={300}></Image>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      paddingLeft: "16px",
                      paddingRight: "16px",
                      position: "absolute",
                      bottom: "92px",
                      width: "100%",
                    }}
                    justify={"space-between"}>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(1)}>
                        Previous
                      </Button>
                    </Col>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(3)}>
                        Next
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
              {step === 3 && (
                <>
                  <Row style={{ padding: "16px" }}>
                    <Col span={12}>
                      <Typography.Paragraph style={{ fontSize: "15px" }}>
                        When you have a card selected you can change anything you would like. Depending on the
                        datasource certain fields may be prepopulated but set to in-active in order to reduce the amount
                        of options visible.
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ fontSize: "15px" }}>
                        You are also able to switch between card variants using the Type option. As of now we have Cards
                        and Sheets. Both with or without icons.
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ fontSize: "15px" }}>
                        After making changes they are only saved if you actually press the Save button located above the
                        treeview. We will try to help remind you if you have any unsaved changes, but closing the
                        browser will not save the card!
                      </Typography.Paragraph>
                    </Col>
                    <Col span={10} push={1}>
                      <Image src={wizard04}></Image>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      paddingLeft: "16px",
                      paddingRight: "16px",
                      position: "absolute",
                      bottom: "92px",
                      width: "100%",
                    }}
                    justify={"space-between"}>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(2)}>
                        Previous
                      </Button>
                    </Col>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(4)}>
                        Next
                      </Button>
                    </Col>
                  </Row>
                </>
              )}

              {step === 4 && (
                <>
                  <Row style={{ padding: "16px" }}>
                    <Col span={12}>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        When you have created your perfect set of cards, you can select your category and press the
                        Share button in the top right.{" "}
                        <Image src={wizard05} preview={false} style={{ height: "48px" }} />
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        The generated link is perfect to share with your friends or to view on your mobile device. This
                        way you can even take your cards with you on the move and use them digitally during a game!
                      </Typography.Paragraph>
                    </Col>
                    <Col span={10} push={1}>
                      <Image src={wizard06}></Image>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      paddingLeft: "16px",
                      paddingRight: "16px",
                      position: "absolute",
                      bottom: "92px",
                      width: "100%",
                    }}
                    justify={"space-between"}>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(3)}>
                        Previous
                      </Button>
                    </Col>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(5)}>
                        Next
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
              {step === 5 && (
                <>
                  <Row style={{ padding: "16px" }}>
                    <Col span={20} push={2}>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        We support multiple kinds of datasources and are adding more everytime we do an update. By
                        default we have the Basic Card set enabled but we do allow you do switch datasources. Please
                        select your prefered datasource below.
                      </Typography.Paragraph>
                      <Alert
                        type="warning"
                        showIcon
                        description={
                          "Please note Game Datacards does not host any of this data. Everything is downloaded remotely and cached locally on your own machine."
                        }
                      />
                    </Col>
                  </Row>
                  <Row style={{ paddingTop: "8px" }} justify={"center"}>
                    <Col span={16}>
                      <Card
                        type={"inner"}
                        title={"Basic Cards"}
                        bodyStyle={{
                          padding: 0,
                          borderBottom: "1px solid #001529",
                        }}
                        style={{
                          marginBottom: "16px",
                          border: "1px solid #001529",
                          borderBottom: "0px",
                        }}
                        extra={
                          <Switch
                            onChange={() =>
                              updateSettings({
                                ...settings,
                                selectedDataSource: "basic",
                              })
                            }
                            disabled={settings.selectedDataSource === "basic"}
                            checked={settings.selectedDataSource === "basic"}
                          />
                        }></Card>
                    </Col>
                    <Col span={16}>
                      <Card
                        type={"inner"}
                        title={"10th Edition datacards"}
                        bodyStyle={{
                          padding: 0,
                          borderBottom: "1px solid #001529",
                        }}
                        style={{
                          marginBottom: "16px",
                          border: "1px solid #001529",
                          borderBottom: "0px",
                        }}
                        extra={
                          <Switch
                            onChange={() =>
                              updateSettings({
                                ...settings,
                                selectedDataSource: "40k-10e",
                              })
                            }
                            disabled={settings.selectedDataSource === "40k-10e"}
                            checked={settings.selectedDataSource === "40k-10e"}
                          />
                        }></Card>
                    </Col>
                    <Col span={16}>
                      <Card
                        type={"inner"}
                        title={"Age of Sigmar"}
                        bodyStyle={{
                          padding: 0,
                          borderBottom: "1px solid #001529",
                        }}
                        style={{
                          marginBottom: "16px",
                          border: "1px solid #001529",
                          borderBottom: "0px",
                        }}
                        extra={
                          <Switch
                            onChange={() =>
                              updateSettings({
                                ...settings,
                                selectedDataSource: "aos",
                              })
                            }
                            disabled={settings.selectedDataSource === "aos"}
                            checked={settings.selectedDataSource === "aos"}
                          />
                        }></Card>
                    </Col>
                    <Col span={16}>
                      <Card
                        type={"inner"}
                        title={"Wahapedia data import 9th edition"}
                        bodyStyle={{
                          padding: 0,
                          borderBottom: "1px solid #001529",
                        }}
                        style={{
                          marginBottom: "16px",
                          border: "1px solid #001529",
                          borderBottom: "0px",
                        }}
                        extra={
                          <Switch
                            onChange={() =>
                              updateSettings({
                                ...settings,
                                selectedDataSource: "40k",
                              })
                            }
                            disabled={settings.selectedDataSource === "40k"}
                            checked={settings.selectedDataSource === "40k"}
                          />
                        }></Card>
                    </Col>
                    <Col span={16}>
                      <Card
                        type={"inner"}
                        title={"10th Combat Patrol datacards"}
                        bodyStyle={{
                          padding: 0,
                          borderBottom: "1px solid #001529",
                        }}
                        style={{
                          marginBottom: "16px",
                          border: "1px solid #001529",
                          borderBottom: "0px",
                        }}
                        extra={
                          <Switch
                            onChange={() =>
                              updateSettings({
                                ...settings,
                                selectedDataSource: "40k-10e-cp",
                              })
                            }
                            disabled={settings.selectedDataSource === "40k-10e-cp"}
                            checked={settings.selectedDataSource === "40k-10e-cp"}
                          />
                        }></Card>
                    </Col>
                    <Col span={16}>
                      <Card
                        type={"inner"}
                        title={"Necromunda"}
                        bodyStyle={{
                          padding: 0,
                          borderBottom: "1px solid #001529",
                        }}
                        style={{
                          marginBottom: "16px",
                          border: "1px solid #001529",
                          borderBottom: "0px",
                        }}
                        extra={
                          <Switch
                            onChange={() =>
                              updateSettings({
                                ...settings,
                                selectedDataSource: "necromunda",
                              })
                            }
                            disabled={settings.selectedDataSource === "necromunda"}
                            checked={settings.selectedDataSource === "necromunda"}
                          />
                        }></Card>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      paddingLeft: "16px",
                      paddingRight: "16px",
                      position: "absolute",
                      bottom: "92px",
                      width: "100%",
                    }}
                    justify={"space-between"}>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(4)}>
                        Previous
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => setStep(6)}
                        disabled={!settings.selectedDataSource}>
                        Next
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
              {step === 6 && (
                <>
                  <Row style={{ padding: "16px" }}>
                    <Col span={24}>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        Thank you for using our app. We hope you are able to create the perfect cards that you need for
                        your Tabletop Warming games. Keep on creating and keep on rolling those dice!
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        If you would like to discuss or request feature we invite you to join our discord server.
                      </Typography.Paragraph>
                    </Col>
                  </Row>
                  <Row style={{ padding: "16px" }} justify={"center"}>
                    <Col span={10}>
                      <a href="https://discord.gg/anfn4qTYC4" target={"_blank"} rel="noreferrer">
                        <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2"></img>
                      </a>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      paddingLeft: "16px",
                      paddingRight: "16px",
                      position: "absolute",
                      bottom: "92px",
                      width: "100%",
                    }}
                    justify={"space-between"}>
                    <Col>
                      <Button type="primary" size="large" onClick={() => setStep(4)}>
                        Previous
                      </Button>
                    </Col>
                    <Col>
                      <Button type="primary" size="large" onClick={endWizard}>
                        Finish
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
              <Row
                style={{
                  paddingTop: "24px",
                  padding: "16px",
                  position: "absolute",
                  bottom: "0px",
                  width: "100%",
                  borderTop: "1px solid #001529",
                }}>
                <Col span={24}>
                  <Steps progressDot current={step}>
                    <Step title="Introduction" />
                    <Step title="Managing Cards" />
                    <Step title="Adding Cards" />
                    <Step title="Editing Cards" />
                    <Step title="Sharing Cards" />
                    <Step title="Datasources" />
                    <Step title="Thank you" />
                  </Steps>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
