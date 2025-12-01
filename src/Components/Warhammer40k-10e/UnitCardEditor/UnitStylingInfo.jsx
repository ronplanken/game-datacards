import { Form, Input, Select, Switch, Upload, Button, Space, Typography, message, Slider, Card } from "antd";
import { Upload as UploadIcon, Trash2 } from "lucide-react";
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
  const {
    saveImage,
    deleteImage,
    getImageData,
    saveFactionSymbol,
    deleteFactionSymbol,
    getFactionSymbolData,
    isReady,
  } = useIndexedDBImages();
  const [localImageInfo, setLocalImageInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [factionSymbolInfo, setFactionSymbolInfo] = useState(null);
  const [uploadingFactionSymbol, setUploadingFactionSymbol] = useState(false);

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

  useEffect(() => {
    const loadFactionSymbolInfo = async () => {
      if (activeCard?.uuid && isReady) {
        const symbolData = await getFactionSymbolData(activeCard.uuid);
        if (symbolData) {
          setFactionSymbolInfo({
            filename: symbolData.filename,
            size: symbolData.size,
          });
        } else {
          setFactionSymbolInfo(null);
        }
      } else {
        setFactionSymbolInfo(null);
      }
    };
    loadFactionSymbolInfo();
  }, [activeCard?.uuid, isReady]);

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

  const handleFactionSymbolUpload = async (file) => {
    const actualFile = file?.file || file;

    if (!actualFile) {
      message.error("No file selected");
      return false;
    }

    if (!activeCard?.uuid) {
      message.error("Please add this card to a category first");
      return false;
    }

    if (actualFile.size > 2 * 1024 * 1024) {
      message.error("Symbol size must be less than 2MB");
      return false;
    }

    if (!actualFile.type.startsWith("image/")) {
      message.error("Please upload an image file");
      return false;
    }

    setUploadingFactionSymbol(true);
    try {
      await saveFactionSymbol(activeCard.uuid, actualFile);

      updateActiveCard({
        ...activeCard,
        hasCustomFactionSymbol: true,
        customFactionSymbolFilename: actualFile.name,
      });

      setTimeout(() => {
        saveActiveCard();
      }, 100);

      setFactionSymbolInfo({
        filename: actualFile.name,
        size: actualFile.size,
      });
      message.success("Faction symbol uploaded successfully");
    } catch (error) {
      console.error("[Upload] Failed to upload faction symbol:", error);
      message.error("Failed to upload faction symbol");
    } finally {
      setUploadingFactionSymbol(false);
    }

    return false;
  };

  const handleDeleteFactionSymbol = async () => {
    if (!activeCard?.uuid) return;

    try {
      await deleteFactionSymbol(activeCard.uuid);
      updateActiveCard({
        ...activeCard,
        hasCustomFactionSymbol: false,
        customFactionSymbolFilename: null,
      });

      setTimeout(() => {
        saveActiveCard();
      }, 100);

      setFactionSymbolInfo(null);
      message.success("Faction symbol removed");
    } catch (error) {
      console.error("Failed to delete faction symbol:", error);
      message.error("Failed to delete faction symbol");
    }
  };

  return (
    <>
      <Card type={"inner"} title="Card Image" size="small" bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
        <Form size="small">
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
                  <Button icon={<UploadIcon size={14} />} loading={uploading} disabled={!isReady}>
                    Upload
                  </Button>
                </Upload>
              ) : (
                <Space>
                  <Text>
                    {localImageInfo.filename} ({formatFileSize(localImageInfo.size)})
                  </Text>
                  <Button icon={<Trash2 size={14} />} size="small" danger onClick={handleDeleteLocalImage}>
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

          <Form.Item label={"Horizontal Position"}>
            <div style={{ paddingRight: "20px" }}>
              <Slider
                min={-200}
                max={200}
                value={activeCard.imagePositionX || 0}
                onChange={(value) => updateActiveCard({ ...activeCard, imagePositionX: value })}
                marks={{
                  [-200]: "Left",
                  0: "Center",
                  200: "Right",
                }}
                tooltip={{ formatter: (value) => `${value > 0 ? "+" : ""}${value}px` }}
              />
            </div>
          </Form.Item>

          <Form.Item label={"Vertical Position"} style={{ marginBottom: 0 }}>
            <div style={{ paddingRight: "20px" }}>
              <Slider
                min={-200}
                max={200}
                value={activeCard.imagePositionY || 0}
                onChange={(value) => updateActiveCard({ ...activeCard, imagePositionY: value })}
                marks={{
                  [-200]: "Top",
                  0: "Center",
                  200: "Bottom",
                }}
                tooltip={{ formatter: (value) => `${value > 0 ? "+" : ""}${value}px` }}
              />
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Card
        type={"inner"}
        title="Faction Symbol"
        size="small"
        bodyStyle={{ padding: activeCard.hasCustomFactionSymbol ? 16 : 0 }}
        extra={
          <Switch
            checked={activeCard.hasCustomFactionSymbol || false}
            onChange={(value) => {
              updateActiveCard({ ...activeCard, hasCustomFactionSymbol: value });
              setTimeout(() => saveActiveCard(), 100);
            }}
          />
        }>
        {activeCard.hasCustomFactionSymbol && (
          <Form size="small">
            <Form.Item label={"External URL"}>
              <Input
                type={"text"}
                value={activeCard.externalFactionSymbol}
                onChange={(e) => updateActiveCard({ ...activeCard, externalFactionSymbol: e.target.value })}
                placeholder="https://example.com/symbol.svg"
              />
            </Form.Item>

            <Form.Item label={"Local Image"}>
              <Space direction="vertical" style={{ width: "100%" }}>
                {!factionSymbolInfo ? (
                  <Upload
                    accept="image/*,.svg"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleFactionSymbolUpload(file);
                      return false;
                    }}
                    disabled={!isReady}>
                    <Button icon={<UploadIcon size={14} />} loading={uploadingFactionSymbol} disabled={!isReady}>
                      Upload Symbol
                    </Button>
                  </Upload>
                ) : (
                  <Space>
                    <Text>
                      {factionSymbolInfo.filename} ({formatFileSize(factionSymbolInfo.size)})
                    </Text>
                    <Button icon={<Trash2 size={14} />} size="small" danger onClick={handleDeleteFactionSymbol}>
                      Remove
                    </Button>
                  </Space>
                )}
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  SVG or PNG recommended. Symbol will be displayed in the faction badge.
                </Text>
              </Space>
            </Form.Item>

            <Form.Item label={"Scale"}>
              <div style={{ paddingRight: "20px" }}>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={activeCard.factionSymbolScale || 0.8}
                  onChange={(value) => updateActiveCard({ ...activeCard, factionSymbolScale: value })}
                  marks={{
                    0.5: "50%",
                    1: "100%",
                    2: "200%",
                  }}
                  tooltip={{ formatter: (value) => `${Math.round(value * 100)}%` }}
                />
              </div>
            </Form.Item>

            <Form.Item label={"Horizontal Position"}>
              <div style={{ paddingRight: "20px" }}>
                <Slider
                  min={-30}
                  max={30}
                  value={activeCard.factionSymbolPositionX || 0}
                  onChange={(value) => updateActiveCard({ ...activeCard, factionSymbolPositionX: value })}
                  marks={{
                    [-30]: "Left",
                    0: "Center",
                    30: "Right",
                  }}
                  tooltip={{ formatter: (value) => `${value > 0 ? "+" : ""}${value}px` }}
                />
              </div>
            </Form.Item>

            <Form.Item label={"Vertical Position"} style={{ marginBottom: 0 }}>
              <div style={{ paddingRight: "20px" }}>
                <Slider
                  min={-30}
                  max={30}
                  value={activeCard.factionSymbolPositionY || 0}
                  onChange={(value) => updateActiveCard({ ...activeCard, factionSymbolPositionY: value })}
                  marks={{
                    [-30]: "Top",
                    0: "Center",
                    30: "Bottom",
                  }}
                  tooltip={{ formatter: (value) => `${value > 0 ? "+" : ""}${value}px` }}
                />
              </div>
            </Form.Item>
          </Form>
        )}
      </Card>
    </>
  );
}
