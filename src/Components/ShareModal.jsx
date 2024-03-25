import { LinkOutlined, ShareAltOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Row, Tooltip, Typography, message } from "antd";
import React from "react";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useFirebase } from "../Hooks/useFirebase";

export const ShareModal = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [shareId, setShareId] = React.useState();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const { shareCategory, logScreenView } = useFirebase();
  const { activeCategory } = useCardStorage();

  return (
    <>
      <Modal
        title="Share your datacard set"
        width={"600px"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={
          <Button
            type="primary"
            onClick={() => {
              setIsModalVisible(false);
              setShareId(undefined);
            }}>
            Ok
          </Button>
        }>
        <Row gutter={8}>
          <Col span={24}>
            <Typography.Paragraph>
              Share your datacard set with others by generating and sharing the following link. When sharing your
              datacard set only active sections will be saved.
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={19}>
            <div
              style={{
                borderRadius: "2px",
                paddingLeft: "8px",
                border: "1px solid #D9D9D9",
                height: "32px",
                lineHeight: "2em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textWrap: "nowrap",
              }}>
              {shareId ? (
                <Typography.Link target={"_blank"} href={`${process.env.REACT_APP_URL}/shared/${shareId}`}>
                  {process.env.REACT_APP_URL}/shared/{shareId}
                </Typography.Link>
              ) : (
                <Typography.Text italic type="secondary">
                  Click generate for a link...
                </Typography.Text>
              )}
            </div>
          </Col>
          {shareId && (
            <Col span={5}>
              <Tooltip title="Copy to clipboard">
                <Button
                  icon={<LinkOutlined />}
                  type={"primary"}
                  onClick={() => {
                    navigator.clipboard.writeText(`${process.env.REACT_APP_URL}/shared/${shareId}`);
                    message.success("Link has been copied");
                  }}>
                  Copy
                </Button>
              </Tooltip>
            </Col>
          )}
          {!shareId && (
            <Col span={5}>
              <Button
                type={"primary"}
                loading={isGenerating}
                onClick={async () => {
                  setIsGenerating(true);
                  const docId = await shareCategory(activeCategory);
                  setShareId(docId.id);
                  setIsGenerating(false);
                }}>
                Generate
              </Button>
            </Col>
          )}
        </Row>
        <Row gutter={8}>
          <Col span={24}>
            <Typography.Text type="secondary" style={{ fontSize: "0.9em" }}>
              Please note that the link is a snapshot of the current set and will not be automatically updated.
            </Typography.Text>
          </Col>
        </Row>
      </Modal>
      <Tooltip title={"Share category"} placement="bottomLeft">
        <Button
          type={"ghost"}
          icon={<ShareAltOutlined />}
          size={"large"}
          onClick={() => {
            logScreenView("Share category");
            setIsModalVisible(true);
          }}
          className={"button-bar"}>
          Share
        </Button>
      </Tooltip>
    </>
  );
};
