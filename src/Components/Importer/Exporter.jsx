import { DownloadOutlined } from "@ant-design/icons";
import { Button, Modal, Tabs, Tooltip } from "antd";
import React from "react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useFirebase } from "../../Hooks/useFirebase";

export const Exporter = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [uploadFile, setUploadFile] = React.useState(null);
  const [fileList, setFileList] = React.useState([]);
  const { importCategory } = useCardStorage();
  const { logScreenView } = useFirebase();

  return (
    <>
      <Modal
        title="Import Game Datacards"
        visible={isModalVisible}
        okButtonProps={{ disabled: !uploadFile }}
        onOk={() => {
          setIsModalVisible(false);
        }}
        onCancel={() => {
          setIsModalVisible(false);
        }}>
        <Tabs>
          <Tabs.TabPane tab={"JSON"} key={"json"} style={{ minHeight: 250 }}></Tabs.TabPane>
        </Tabs>
      </Modal>
      <Tooltip title={"Export category to a format"} placement="bottomLeft">
        <Button
          type={"text"}
          shape={"circle"}
          icon={<DownloadOutlined />}
          onClick={() => {
            logScreenView("Export Category");
            setIsModalVisible(true);
          }}
        />
      </Tooltip>
    </>
  );
};
