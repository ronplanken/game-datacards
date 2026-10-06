import { HelpCircle } from "lucide-react";
import { Button, Col, Row, Typography } from "antd";
import React from "react";
import * as ReactDOM from "react-dom";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";

const modalRoot = document.getElementById("modal-root");

export const PrintFaq = () => {
  const [isPrintFaqVisible, setIsPrintFaqVisible] = React.useState(false);

  const closeModal = () => {
    setIsPrintFaqVisible(false);
  };

  return (
    <>
      {isPrintFaqVisible &&
        ReactDOM.createPortal(
          <div className="modal-background">
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
                  Frequently asked questions
                </h1>
              </div>
              <div className="welcome-cover">
                <Row style={{ padding: "16px" }}>
                  <Col>
                    <Typography.Title level={5}>
                      Below are some of the more frequently asked questions for printing:
                    </Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>I&apos;m not seeing any background colors for my cards!</strong>
                          <br />
                          Make sure you go to More settings in your browsers print window and enable Background Images &
                          Colors printing.
                        </li>
                        <li>
                          <strong>Why am I seeing margins on the print window?</strong>
                          <br />
                          Make sure you go to More settings in your browsers print window and set the Margins to None.
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
                    <Button type="primary" size="large" onClick={() => closeModal()}>
                      Close
                    </Button>
                  </Col>
                  <Col></Col>
                </Row>
              </div>
            </div>
          </div>,
          modalRoot,
        )}
      <Button
        style={{
          width: "32px",
          padding: "0px",
          marginTop: "-4px",
        }}
        type="ghost"
        onClick={() => setIsPrintFaqVisible(true)}>
        <HelpCircle size={14} />
      </Button>
    </>
  );
};
