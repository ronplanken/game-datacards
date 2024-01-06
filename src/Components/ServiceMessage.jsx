import { Button, Carousel, Col, Row, Typography } from "antd";
import React, { useEffect } from "react";
import { getMessages } from "../Helpers/external.helpers";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";

const DEFAULT_MESSAGE_ID = 0;

export const ServiceMessage = () => {
  const [serviceMessageVisible, setServiceMessageVisible] = React.useState(false);
  const [lastMessageId, setLastMessageId] = React.useState(DEFAULT_MESSAGE_ID);
  const [messages, setMessages] = React.useState(DEFAULT_MESSAGE_ID);
  const { settings, updateSettings } = useSettingsStorage();

  const closeServiceMessage = () => {
    setServiceMessageVisible(false);
    updateSettings({
      ...settings,
      serviceMessage: lastMessageId || 0,
    });
  };

  useEffect(() => {
    const checkMessages = async () => {
      const messages = await getMessages();
      if (!messages) {
        return;
      }
      if (settings.serviceMessage >= DEFAULT_MESSAGE_ID && settings.serviceMessage < messages.lastMessageId) {
        setServiceMessageVisible(true);
        setMessages(messages.messages);
        setLastMessageId(messages.lastMessageId);
      }
    };

    checkMessages();
  }, [settings.ServiceMessage]);

  return (
    <>
      {serviceMessageVisible && (
        <div className="welcome-background">
          <div className="whatsnew-container">
            <div
              style={{
                backgroundColor: "#001529",
                width: "100%",
                textAlign: "center",
              }}>
              <h1
                style={{
                  height: "100%",
                  lineHeight: "90px",
                  fontSize: "24px",
                  color: "white",
                }}>
                Messages
              </h1>
            </div>
            <div className="welcome-cover">
              <Carousel dots={{ className: "dots" }}>
                {messages.map((message) => {
                  return (
                    <Row style={{ padding: "16px" }} className="whatsnew-content" key={message.id}>
                      <Col>
                        <Typography.Title level={5}>{message.title}</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>{message.body}</Typography.Paragraph>
                      </Col>
                    </Row>
                  );
                })}
              </Carousel>
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
                  <Button type="primary" size="large" onClick={() => closeServiceMessage()}>
                    Close
                  </Button>
                </Col>
                <Col></Col>
              </Row>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
