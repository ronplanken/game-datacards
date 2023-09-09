import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { Dropdown, Input, Menu, Modal, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useCardStorage } from "../Hooks/useCardStorage";
import { List } from "../Icons/List";

const { confirm } = Modal;

export function TreeCategory({ category, selectedTreeIndex, setSelectedTreeIndex, children }) {
  const { cardStorage, setActiveCard, setActiveCategory, removeCategory, renameCategory, cardUpdated, updateCategory } =
    useCardStorage();

  const inputRef = useRef(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(category.name);

  useEffect(() => {
    if (isModalVisible) {
      inputRef.current.focus({
        cursor: "end",
      });
    }
  }, [isModalVisible, inputRef]);

  const pointsTotal = category.cards?.reduce((total, card) => {
    if (card?.source === "40k-10e" && card?.unitSize?.cost) {
      if (card.selectedEnhancement) {
        return total + Number(card?.unitSize?.cost) + Number(card.selectedEnhancement.cost);
      }
      return total + Number(card?.unitSize?.cost);
    }
    return 0;
  }, 0);

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
                {category.type !== "list" && (category.type !== "list" ? <FolderOutlined /> : <FolderOpenOutlined />)}
                {category.type === "list" && <List />}
                &nbsp;{category.name}&nbsp;
                {category?.settings?.showPointTotal && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      border: "0px solid white",
                      backgroundColor: "#001529",
                      color: "white",
                      marginTop: "1px",
                      marginBottom: "1px",
                      paddingTop: "1px",
                      paddingBottom: "1px",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      borderRadius: "6px",
                      textAlign: "center",
                      float: "right",
                      marginRight: "8px",
                      minWidth: "40px",
                    }}>
                    <strong>{pointsTotal}</strong>
                  </span>
                )}
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
        <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} ref={inputRef} />
      </Modal>
    </>
  );
}
