import { DeleteOutlined, FileOutlined, InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Row, Tabs, Tooltip } from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { compare } from "compare-versions";
import React from "react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useFirebase } from "../../Hooks/useFirebase";

export const Importer = () => {
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
          if (compare(uploadFile.version, "0.4.0", "=")) {
            importCategory({
              uuid: uuidv4(),
              name: "Imported Cards",
              cards: uploadFile.cards,
            });
          }
          if (compare(uploadFile.version, "0.5.0", ">=") && compare(uploadFile.version, "1.2.0", "<=")) {
            importCategory({
              ...uploadFile.category,
              cards: uploadFile.category.cards.map((card) => {
                return { ...card, source: "40k" };
              }),
            });
          }
          if (compare(uploadFile.version, "1.3.0", ">=")) {
            importCategory(uploadFile.category);
          }
          setFileList([]);
          setUploadFile(null);
          setIsModalVisible(false);
        }}
        onCancel={() => {
          setIsModalVisible(false);
          setFileList([]);
          setUploadFile(null);
        }}>
        <Tabs>
          <Tabs.TabPane tab={"Game-datacards"} key={"game-datacards"} style={{ minHeight: 250 }}>
            <Row>
              <Col span={24}>
                <Dragger
                  fileList={fileList}
                  multiple={false}
                  maxCount={1}
                  action={null}
                  accept={".json"}
                  itemRender={(node, file) => {
                    return file.status === "success" ? (
                      <Row
                        style={{
                          marginTop: "4px",
                          padding: "8px",
                          border: `1px solid #E5E5E5`,
                          borderRadius: 4,
                        }}
                        align={"middle"}
                        justify={"space-around"}>
                        <Col>
                          <FileOutlined style={{ fontSize: "18px" }} />
                        </Col>
                        <Col>{file.name}</Col>
                        <Col>{`${Math.round(file.size / 1024, 1)}KiB`}</Col>
                        <Col>
                          <Button
                            type={"text"}
                            shape={"circle"}
                            onClick={() => {
                              setFileList(null);
                              setUploadFile(null);
                            }}
                            icon={<DeleteOutlined />}
                          />
                        </Col>
                      </Row>
                    ) : (
                      <Tooltip title={"This file cannot be read as an Game Datacards export."} color={"red"}>
                        <Row
                          style={{
                            marginTop: "4px",
                            padding: "8px",
                            border: `1px solid red`,
                            borderRadius: 4,
                          }}
                          align={"middle"}
                          justify={"space-around"}>
                          <Col>
                            <FileOutlined style={{ fontSize: "18px" }} />
                          </Col>
                          <Col>{file.name}</Col>
                          <Col>{`${Math.round(file.size / 1024, 1)}KiB`}</Col>
                          <Col>
                            <Button
                              type={"text"}
                              shape={"circle"}
                              onClick={() => {
                                setFileList(null);
                                setUploadFile(null);
                              }}
                              icon={<DeleteOutlined />}
                            />
                          </Col>
                        </Row>
                      </Tooltip>
                    );
                  }}
                  beforeUpload={(file) => {
                    var reader = new FileReader();

                    reader.onload = function (event) {
                      try {
                        const importedJson = JSON.parse(event.target.result);
                        if (importedJson.website && importedJson.website === "https://game-datacards.eu") {
                          setFileList([
                            {
                              uid: "-1",
                              name: `${file.name} [ver. ${importedJson.version}]`,
                              status: "success",
                              size: file.size,
                            },
                          ]);
                          setUploadFile(importedJson);
                        } else {
                          setFileList([
                            {
                              uid: "-1",
                              name: file.name,
                              status: "error",
                              size: file.size,
                            },
                          ]);
                          setUploadFile(null);
                        }
                      } catch (e) {
                        setFileList([
                          {
                            uid: "-1",
                            name: file.name,
                            status: "error",
                            size: file.size,
                          },
                        ]);
                        setUploadFile(null);
                      }
                    };
                    reader.readAsText(file);

                    return false;
                  }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag a file to this area to upload</p>
                  <p className="ant-upload-hint">Support for a single file upload. Only .json files.</p>
                </Dragger>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
      <Tooltip title={"Import category from JSON"} placement="bottomLeft">
        <Button
          type={"text"}
          shape={"circle"}
          icon={<UploadOutlined />}
          onClick={() => {
            logScreenView("Import Category");
            setIsModalVisible(true);
          }}
        />
      </Tooltip>
    </>
  );
};
