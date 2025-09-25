import { Form, Input, Select, Switch, Upload, Button, Space, Typography, message } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useCallback } from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { useIndexedDBImages } from "../../../Hooks/useIndexedDBImages";

const { Option } = Select;
const { Text } = Typography;

export function UnitStylingInfo() {
  const { activeCard, updateActiveCard, saveActiveCard } = useCardStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const { saveImage, deleteImage, getImageData, isReady } = useIndexedDBImages();
  const [localImageInfo, setLocalImageInfo] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadImageInfo = async () => {
      // Always use uuid for local images (unique per card instance)
      if (activeCard?.uuid && isReady) {
        console.log("[UnitStylingInfo] Loading image info for UUID:", activeCard.uuid);
        const imageData = await getImageData(activeCard.uuid);
        if (imageData) {
          setLocalImageInfo({
            filename: imageData.filename,
            size: imageData.size,
          });
        } else {
          setLocalImageInfo(null);
        }
      } else {
        // Clear local image info if no card or not ready
        setLocalImageInfo(null);
      }
    };
    loadImageInfo();
  }, [activeCard?.uuid, isReady]); // getImageData excluded to prevent infinite loop

  const handleImageUpload = async (file) => {
    console.log("[Upload] Starting upload process");
    console.log("[Upload] Received file argument:", file);
    console.log("[Upload] File type:", typeof file);
    console.log("[Upload] File constructor:", file?.constructor?.name);

    // Handle both direct file and wrapped file object from Ant Design
    const actualFile = file?.file || file;

    console.log("[Upload] Actual file:", actualFile);
    console.log("[Upload] Active card:", activeCard);
    console.log("[Upload] Card UUID:", activeCard?.uuid);
    console.log("[Upload] Card ID (template):", activeCard?.id);

    if (!actualFile) {
      console.error("[Upload] No file provided");
      message.error("No file selected");
      return false;
    }

    console.log("[Upload] File details:", {
      name: actualFile.name,
      size: actualFile.size,
      type: actualFile.type,
      isFile: actualFile instanceof File,
      isBlob: actualFile instanceof Blob,
    });

    // Always use uuid for local images (unique per card instance)
    if (!activeCard?.uuid) {
      console.error("[Upload] No card UUID found - card needs to be added to a category first");
      message.error("Please add this card to a category first");
      return false;
    }

    if (actualFile.size > 5 * 1024 * 1024) {
      message.error("Image size must be less than 5MB");
      return false;
    }

    if (!actualFile.type.startsWith("image/")) {
      message.error("Please upload an image file");
      return false;
    }

    setUploading(true);
    try {
      console.log("[Upload] Saving image with UUID:", activeCard.uuid);
      console.log("[Upload] File to save:", actualFile);
      await saveImage(activeCard.uuid, actualFile);
      console.log("[Upload] Image saved to IndexedDB");

      const updatedCard = {
        ...activeCard,
        hasLocalImage: true,
        localImageFilename: actualFile.name,
      };
      console.log("[Upload] Updating active card with:", {
        hasLocalImage: true,
        localImageFilename: actualFile.name,
        uuid: activeCard.uuid,
      });
      updateActiveCard(updatedCard);

      // Save the card to persist the changes
      setTimeout(() => {
        console.log("[Upload] Saving card to localStorage");
        saveActiveCard();
      }, 100);

      setLocalImageInfo({
        filename: actualFile.name,
        size: actualFile.size,
      });
      message.success("Image uploaded successfully");
    } catch (error) {
      console.error("[Upload] Failed to upload image:", error);
      message.error("Failed to upload image");
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleDeleteLocalImage = async () => {
    // Always use uuid for local images (unique per card instance)
    if (!activeCard?.uuid) return;

    try {
      await deleteImage(activeCard.uuid);
      updateActiveCard({
        ...activeCard,
        hasLocalImage: false,
        localImageFilename: null,
      });

      // Save the card to persist the changes
      setTimeout(() => {
        saveActiveCard();
      }, 100);

      setLocalImageInfo(null);
      message.success("Local image removed");
    } catch (error) {
      console.error("Failed to delete image:", error);
      message.error("Failed to delete image");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    else return Math.round((bytes / 1048576) * 10) / 10 + " MB";
  };

  return (
    <Form>
      <Form.Item label={"External Image URL"}>
        <Input
          type={"text"}
          value={activeCard.externalImage}
          onChange={(e) => updateActiveCard({ ...activeCard, externalImage: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </Form.Item>

      <Form.Item label={"Local Image"}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {!localImageInfo ? (
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                console.log("[Upload Component] beforeUpload called with:", file);
                handleImageUpload(file);
                return false; // Prevent default upload behavior
              }}
              disabled={!isReady}>
              <Button icon={<UploadOutlined />} loading={uploading} disabled={!isReady}>
                Upload Local Image
              </Button>
            </Upload>
          ) : (
            <Space>
              <Text>
                {localImageInfo.filename} ({formatFileSize(localImageInfo.size)})
              </Text>
              <Button icon={<DeleteOutlined />} size="small" danger onClick={handleDeleteLocalImage}>
                Remove
              </Button>
            </Space>
          )}
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Local images are stored in your browser and won&apos;t be shared
          </Text>
        </Space>
      </Form.Item>

      <Form.Item label={"Show on top"}>
        <Select
          value={activeCard.imageZIndex || "default"}
          onChange={(value) => updateActiveCard({ ...activeCard, imageZIndex: value })}>
          <Option value="default">Default</Option>
          <Option value="onTop">On top</Option>
        </Select>
      </Form.Item>
    </Form>
  );
}
