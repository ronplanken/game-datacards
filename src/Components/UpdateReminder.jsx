import { Button, Col, Row, Typography } from "antd";
import { compare } from "compare-versions";
import React, { useEffect } from "react";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";

export const UpdateReminder = () => {
  const [isUpdateReminderVisible, setIsUpdateReminderVisible] = React.useState(false);

  const { dataSource } = useDataSourceStorage();

  useEffect(() => {
    if (dataSource.lastUpdated && dataSource.lastUpdated) {

    }
  }, [dataSource]);

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
                Whats new in 1.3.2
              </h1>
            </div>
            <div className="welcome-cover">
              <>
                <Row style={{ padding: "16px" }}>
                  <Col>
                    <b>18-08-2022</b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>You can now collapse categories.</strong>
                          <br />
                          By clicking on the arrow in front of a category you can collapse the category, showing /
                          hiding the cards. Clicking anywhere else on the category itself will still select it.
                        </li>
                        <li>
                          <strong>Backgrounds for unit cards</strong>
                          <br />
                          You can now select an optional background for unit cards (40k / Basic)
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Basic / 40K</strong> The faction select box now has full names instead of just a
                          string.
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
