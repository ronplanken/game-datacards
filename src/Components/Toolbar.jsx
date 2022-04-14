import {
  DeleteOutlined,
  PrinterOutlined,
  SaveOutlined,
  DownloadOutlined,
  UploadOutlined,
  InboxOutlined,
  FileOutlined,
  FolderAddOutlined,
} from '@ant-design/icons';
import { Button, Col, message, Modal, Row, Tooltip } from 'antd';
import Dragger from 'antd/lib/upload/Dragger';
import React from 'react';
import { useCardStorage } from '../Hooks/useCardStorage';
import { v4 as uuidv4 } from 'uuid';

export const Toolbar = ({ setShowPrint, selectedTreeKey, setSelectedTreeKey }) => {
  const [uploadFile, setUploadFile] = React.useState(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const [fileList, setFileList] = React.useState([]);

  const {
    activeCategory,
    saveActiveCard,
    importCategory,
    cardUpdated,
    addCategory,
  } = useCardStorage();

  return (
    <Row>
      <Col
        span={10}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          background: 'white',
          borderBottom: '1px solid #E5E5E5',
        }}
      >
        <Modal
          title='Import Game Datacards'
          visible={isModalVisible}
          okButtonProps={{ disabled: !uploadFile }}
          onOk={() => {
            if (uploadFile.version === '0.4.0') {
              importCategory({ uuid: uuidv4(), name: 'Imported Cards', cards: uploadFile.cards });
            }
            if (uploadFile.version === '0.5.0') {
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
          }}
        >
          <div>
            <Dragger
              fileList={fileList}
              multiple={false}
              maxCount={1}
              action={null}
              accept={'.json'}
              itemRender={(node, file) => {
                return file.status === 'success' ? (
                  <Row
                    style={{ marginTop: '4px', padding: '8px', border: `1px solid #E5E5E5`, borderRadius: 4 }}
                    align={'middle'}
                    justify={'space-around'}
                  >
                    <Col>
                      <FileOutlined style={{ fontSize: '18px' }} />
                    </Col>
                    <Col>{file.name}</Col>
                    <Col>{`${Math.round(file.size / 1024, 1)}KiB`}</Col>
                    <Col>
                      <Button
                        type={'text'}
                        shape={'circle'}
                        onClick={() => {
                          setFileList(null);
                          setUploadFile(null);
                        }}
                        icon={<DeleteOutlined />}
                      />
                    </Col>
                  </Row>
                ) : (
                  <Tooltip title={'This file cannot be read as an Game Datacards export.'} color={'red'}>
                    <Row
                      style={{ marginTop: '4px', padding: '8px', border: `1px solid red`, borderRadius: 4 }}
                      align={'middle'}
                      justify={'space-around'}
                    >
                      <Col>
                        <FileOutlined style={{ fontSize: '18px' }} />
                      </Col>
                      <Col>{file.name}</Col>
                      <Col>{`${Math.round(file.size / 1024, 1)}KiB`}</Col>
                      <Col>
                        <Button
                          type={'text'}
                          shape={'circle'}
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
                    if (importedJson.website && importedJson.website === 'https://game-datacards.eu') {
                      setFileList([
                        {
                          uid: '-1',
                          name: `${file.name} [ver. ${importedJson.version}]`,
                          status: 'success',
                          size: file.size,
                        },
                      ]);
                      setUploadFile(importedJson);
                    } else {
                      setFileList([
                        {
                          uid: '-1',
                          name: file.name,
                          status: 'error',
                          size: file.size,
                        },
                      ]);
                      setUploadFile(null);
                    }
                  } catch (e) {
                    setFileList([
                      {
                        uid: '-1',
                        name: file.name,
                        status: 'error',
                        size: file.size,
                      },
                    ]);
                    setUploadFile(null);
                  }
                };
                reader.readAsText(file);

                return false;
              }}
            >
              <p className='ant-upload-drag-icon'>
                <InboxOutlined />
              </p>
              <p className='ant-upload-text'>Click or drag file to this area to upload</p>
              <p className='ant-upload-hint'>Support for a single file upload. Only .json files.</p>
            </Dragger>
          </div>
        </Modal>
        <Tooltip title={'Print cards from category'} placement='bottomLeft'>
          <Button
            type={'text'}
            shape={'circle'}
            disabled={!(activeCategory && activeCategory.cards.length > 0)}
            onClick={() => {
              setShowPrint(true);
            }}
            icon={<PrinterOutlined />}
          />
        </Tooltip>
        <Tooltip title={'Export category to JSON'} placement='bottomLeft'>
          <Button
            type={'text'}
            shape={'circle'}
            disabled={!(activeCategory && activeCategory.cards.length > 0)}
            onClick={() => {
              const exportCategory = {
                ...activeCategory,
                uuid: uuidv4(),
                cards: activeCategory.cards.map((card) => {
                  return { ...card, uuid: uuidv4() };
                }),
              };
              const exportData = {
                category: exportCategory,
                createdAt: new Date().toISOString(),
                version: process.env.REACT_APP_VERSION,
                website: 'https://game-datacards.eu',
              };
              const url = window.URL.createObjectURL(
                new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
              );
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `${activeCategory.name}-${new Date().toISOString()}.json`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            icon={<DownloadOutlined />}
          />
        </Tooltip>
        <Tooltip title={'Import category from JSON'} placement='bottomLeft'>
          <Button
            type={'text'}
            shape={'circle'}
            icon={<UploadOutlined />}
            onClick={() => {
              setIsModalVisible(true);
            }}
          />
        </Tooltip>
        <Tooltip title={'Add new category'} placement='bottomLeft'>
          <Button
            type={'text'}
            shape={'circle'}
            icon={<FolderAddOutlined />}
            onClick={() => {
              addCategory('New Category');
            }}
          />
        </Tooltip>
      </Col>
      <Col
        span={14}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'end',
          background: 'white',
          borderBottom: '1px solid #E5E5E5',
          alignItems: 'center',
          paddingRight: '4px',
        }}
      >
        {selectedTreeKey && selectedTreeKey.includes('card') && (
          <>
            <Tooltip title={'Update selected card'} placement='bottom'>
              <Button
                icon={<SaveOutlined />}
                type={'ghost'}
                size={'small'}
                disabled={!cardUpdated}
                onClick={() => {
                  saveActiveCard();
                  message.success('Card has been updated');
                }}
              >
                save
              </Button>
            </Tooltip>
          </>
        )}
      </Col>
    </Row>
  );
};
