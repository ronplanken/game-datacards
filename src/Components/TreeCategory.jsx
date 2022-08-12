import React, { useState } from "react";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useCardStorage } from "../Hooks/useCardStorage";
import { Dropdown, Input, Menu, message, Modal } from "antd";

const { confirm } = Modal;

export function TreeCategory({ category, selectedTreeIndex, setSelectedTreeIndex, children }) {
  const { cardStorage, setActiveCard, setActiveCategory, removeCategory, renameCategory, cardUpdated, updateCategory } =
    useCardStorage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(category.name);

  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => {
          setIsModalVisible(true);
        }}>
        Rename
      </Menu.Item>
      <Menu.Item
        key="2"
        disabled={cardStorage.categories.length === 1}
        icon={<DeleteOutlined />}
        onClick={() => {
          confirm({
            title: "Are you sure you want to delete this category?",
            content: "This action cannot be undone and will delete all cards in the category.",
            icon: <ExclamationCircleOutlined />,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: () => {
              message.success("Category has been removed.");
              removeCategory(category.uuid);
            },
          });
        }}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const onSelect = () => {
    if (selectedTreeIndex === `cat-${category.uuid}`) {
      setSelectedTreeIndex(null);
      setActiveCard(null);
      setActiveCategory(null);
    } else {
      setSelectedTreeIndex(`cat-${category.uuid}`);
      setActiveCard(null);
      setActiveCategory(category);
    }
  };

  return (
    <>
      <>
        <div
          style={{
            paddingLeft: 4,
            height: 24,
            fontSize: "14px",
            alignContent: "center",
            display: "flex",
            width: "100%",
          }}
          className={["tree-item-container", selectedTreeIndex === `cat-${category.uuid}` ? "selected" : ""].join(" ")}>
          <>
            <div
              className={"tree-state"}
              onClick={() => {
                updateCategory({ ...category, closed: !category.closed }, category.uuid);
              }}>
              {category.closed ? <CaretRightOutlined /> : <CaretDownOutlined />}
            </div>
            <Dropdown overlay={menu} trigger={["contextMenu"]}>
              <div
                className={"tree-item"}
                onClick={() => {
                  if (cardUpdated) {
                    confirm({
                      title: "You have unsaved changes",
                      content: "Are you sure you want to discard your changes?",
                      icon: <ExclamationCircleOutlined />,
                      okText: "Yes",
                      okType: "danger",
                      cancelText: "No",
                      onOk: () => {
                        onSelect();
                      },
                    });
                  } else {
                    onSelect();
                  }
                }}>
                &nbsp;
                {category.closed ? <FolderOutlined /> : <FolderOpenOutlined />}
                &nbsp;{category.name}
              </div>
            </Dropdown>
          </>
        </div>
        {!category.closed && children}
      </>
      <Modal
        title="Rename category"
        visible={isModalVisible}
        onOk={() => {
          renameCategory(category.uuid, newCategoryName);
          setIsModalVisible(false);
          message.success("Category has been renamed.");
        }}
        onCancel={() => {
          setIsModalVisible(false);
        }}>
        <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
      </Modal>
    </>
  );
}
