import {
  AppstoreAddOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PrinterOutlined,
  SaveOutlined,
  DownloadOutlined,
  UploadOutlined,
  InboxOutlined,
  FileOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { Button, Col, message, Modal, Row, Tooltip } from 'antd';
import Dragger from 'antd/lib/upload/Dragger';
import React from 'react';
import { useCardStorage } from '../Hooks/useCardStorage';
import { v4 as uuidv4 } from 'uuid';

const { confirm } = Modal;

export const Toolbar = ({ setShowPrint, selectedTreeKey, setSelectedTreeKey }) => {
  const [uploadFile, setUploadFile] = React.useState(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const [fileList, setFileList] = React.useState([]);

  const {
    cardStorage,
    activeCard,
    setActiveCard,
    activeCategory,
    setActiveCategory,
    addCardToCategory,
    removeCardFromCategory,
    saveActiveCard,
    cardUpdated,
  } = useCardStorage();

  return (
    <Row>
      <Col
        span={8}
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
            if (cardStorage) {
              confirm({
                title: 'Are you sure you want to import this file?',
                content: 'This will overwrite your current cards.',
                icon: <ExclamationCircleOutlined />,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => {
                  // setCards(uploadFile.cards);
                  localStorage.setItem('cards', JSON.stringify(uploadFile.cards));
                  setFileList([]);
                  setUploadFile(null);
                  setIsModalVisible(false);
                },
              });
            } else {
              // setCards(uploadFile.cards);
              localStorage.setItem('cards', JSON.stringify(uploadFile.cards));
              setFileList([]);
              setUploadFile(null);
              setIsModalVisible(false);
            }
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
                setUploadFile(file);
                var reader = new FileReader();

                reader.onload = function (event) {
                  try {
                    const importedJson = JSON.parse(event.target.result);
                    if (importedJson.website && importedJson.website === 'https://game-datacards.eu') {
                      setFileList([
                        {
                          uid: '-1',
                          name: file.name,
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
        <Tooltip title={'Print cards'} placement='bottomLeft'>
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
              const exportData = {
                category: activeCategory,
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
      </Col>
      <Col
        span={16}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'end',
          background: 'white',
          borderBottom: '1px solid #E5E5E5',
        }}
      >
        {selectedTreeKey && selectedTreeKey.includes('card') && (
          <>
            <Tooltip title={'Update selected card'} placement='bottom'>
              <Button
                icon={<SaveOutlined />}
                type={'text'}
                shape={'circle'}
                disabled={!cardUpdated}
                onClick={() => {
                  saveActiveCard();
                  message.success('Card has been updated');
                }}
              ></Button>
            </Tooltip>
            <Tooltip title={'Remove selected card'} placement='bottomRight'>
              <Button
                icon={<DeleteOutlined />}
                type={'text'}
                shape={'circle'}
                onClick={() => {
                  confirm({
                    title: 'Are you sure you want to delete this card?',
                    icon: <ExclamationCircleOutlined />,
                    okText: 'Yes',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk: () => {
                      removeCardFromCategory(activeCard.uuid);
                      setActiveCard(null);
                      setSelectedTreeKey(null);
                    },
                  });
                }}
              />
            </Tooltip>
          </>
        )}
        {activeCard && !activeCard.isCustom && (
          <Tooltip title='Add card to category' placement='bottomRight'>
            <Button
              icon={<AppstoreAddOutlined />}
              type={'text'}
              shape={'circle'}
              onClick={() => {
                const newCard = { ...activeCard, isCustom: true, uuid: uuidv4() };
                addCardToCategory(newCard);
                setActiveCard(newCard)
                setSelectedTreeKey(`card-${newCard.uuid}`);
              }}
            />
          </Tooltip>
        )}
        {activeCard && activeCard.isCustom && (
          <Tooltip title='Duplicate card' placement='bottomRight'>
            <Button
              icon={<CopyOutlined />}
              type={'text'}
              shape={'circle'}
              onClick={() => {
                const newCard = { ...activeCard, name: `${activeCard.name} Copy`, isCustom: true, uuid: uuidv4() };
                addCardToCategory(newCard);
                setActiveCard(newCard)
                setSelectedTreeKey(`card-${newCard.uuid}`);
              }}
            />
          </Tooltip>
        )}
      </Col>
    </Row>
  );
};
