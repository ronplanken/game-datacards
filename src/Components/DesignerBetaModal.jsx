import React from "react";
import { Modal, Button, Typography } from "antd";

const { Title, Paragraph } = Typography;

export const DesignerBetaModal = ({ visible, onAccept, onDecline }) => {
  return (
    <Modal
      open={visible}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="decline" onClick={onDecline}>
          Go back
        </Button>,
        <Button key="accept" type="primary" onClick={onAccept}>
          {"I understand, let's go"}
        </Button>,
      ]}
      width={520}>
      <Typography>
        <Title level={4}>Card Designer is in Beta</Title>
        <Paragraph>
          {
            "The Card Designer is an early feature that's still actively being developed. Things may change, break, or work differently in future updates."
          }
        </Paragraph>
        <Paragraph>
          {
            "Templates you create during the beta are not guaranteed to remain compatible with future versions. We can't restore or fix templates that stop working after an update."
          }
        </Paragraph>
        <Paragraph type="secondary">
          By continuing, you accept that this feature is provided as-is and that template compatibility may change
          without notice.
        </Paragraph>
      </Typography>
    </Modal>
  );
};
