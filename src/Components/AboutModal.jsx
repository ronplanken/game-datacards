import { Button, Modal, Space, Typography } from "antd";
import { Tooltip } from "./Tooltip/Tooltip";
import React from "react";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";

export const AboutModal = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const { settings, updateSettings } = useSettingsStorage();

  const showWizard = () => {
    setIsModalVisible(false);
    updateSettings({ ...settings, wizardCompleted: "1.1.0" });
  };

  return (
    <>
      <Modal
        title="About &amp; Help"
        width={"850px"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setIsModalVisible(false);
              }}>
              Close
            </Button>
          </Space>
        }>
        <div>
          <p>
            The Game Datacards website is a tool to help Tabletop Wargaming players around the world create their own
            custom datacards for printing.
          </p>
          <b>An extra thank you to:</b>
          <ul>
            <li>
              <p>
                External data sources are powered by{" "}
                <Typography.Link href="https://wahapedia.ru/">Wahapedia</Typography.Link>.
              </p>
            </li>
            <li>
              <p>
                Card design &amp; icons are created by Locequen. (
                <Typography.Link href="https://github.com/Locequen/40k-Data-Card">
                  Locequen / 40k-Data-Card on Github
                </Typography.Link>
                )
              </p>
            </li>
          </ul>
          <p>
            <b>If you want to replay the wizard use the following button:</b>
          </p>
          <Button type="primary" onClick={showWizard}>
            Replay the wizard
          </Button>
        </div>
      </Modal>
      <Tooltip content="About & Help" placement="bottom-start">
        <Button
          size="large"
          type={"ghost"}
          style={{ color: "white" }}
          onClick={() => {
            setIsModalVisible(true);
          }}>
          About
        </Button>
      </Tooltip>
    </>
  );
};
