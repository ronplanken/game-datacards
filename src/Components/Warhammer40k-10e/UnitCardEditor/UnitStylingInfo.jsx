import { Form, Input, Select, Switch, Upload, Button, Space, Typography, Slider, Card } from "antd";
import { message } from "../../Toast/message";
import { Upload as UploadIcon, Trash2 } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { useIndexedDBImages } from "../../../Hooks/useIndexedDBImages";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";

const { Option } = Select;
const { Text } = Typography;

export function UnitStylingInfo() {
  const { activeCard, updateActiveCard, saveActiveCard } = useCardStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const { dataSource } = useDataSourceStorage();
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
    // Handle both direct file and wrapped file object from Ant Design
    const actualFile = file?.file || file;

    if (!actualFile) {
      message.error("No file selected");
      return false;
    }

    // Always use uuid for local images (unique per card instance)
    if (!activeCard?.uuid) {
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
      await saveImage(activeCard.uuid, actualFile);

      const updatedCard = {
        ...activeCard,
        hasLocalImage: true,
        localImageFilename: actualFile.name,
      };
      updateActiveCard(updatedCard);

      // Save the card to persist the changes
      setTimeout(() => {
        saveActiveCard();
      }, 100);

      setLocalImageInfo({
        filename: actualFile.name,
        size: actualFile.size,
      });
      message.success("Image uploaded successfully");
    } catch (error) {
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

      <Card
        type={"inner"}
        title="Custom Colours"
        size="small"
        bodyStyle={{ padding: activeCard.useCustomColours ? 16 : 0 }}
        style={{ marginTop: 16 }}
        extra={
          <Switch
            checked={activeCard.useCustomColours || false}
            onChange={(value) => {
              // When enabling, initialize with faction colors if not already set
              const cardFaction = dataSource?.data?.find((f) => f.id === activeCard?.faction_id);
              const updates = { useCustomColours: value };
              if (value && !activeCard.customBannerColour) {
                updates.customBannerColour = cardFaction?.colours?.banner || "#103344";
              }
              if (value && !activeCard.customHeaderColour) {
                updates.customHeaderColour = cardFaction?.colours?.header || "#456664";
              }
              updateActiveCard({ ...activeCard, ...updates });
            }}
          />
        }>
        {activeCard.useCustomColours && (
          <Form size="small">
            <Form.Item label={"Banner Colour"}>
              <Space>
                <input
                  type="color"
                  value={activeCard.customBannerColour || "#103344"}
                  onChange={(e) => {
                    updateActiveCard({ ...activeCard, customBannerColour: e.target.value });
                  }}
                  style={{
                    width: 40,
                    height: 28,
                    padding: 0,
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                />
                <Input
                  size="small"
                  value={activeCard.customBannerColour || "#103344"}
                  onChange={(e) => {
                    updateActiveCard({ ...activeCard, customBannerColour: e.target.value });
                  }}
                  style={{ width: 90, fontFamily: "monospace" }}
                />
              </Space>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: 4 }}>
                Used for the unit name background and stat headers
              </Text>
            </Form.Item>

            <Form.Item label={"Header Colour"} style={{ marginBottom: 0 }}>
              <Space>
                <input
                  type="color"
                  value={activeCard.customHeaderColour || "#456664"}
                  onChange={(e) => {
                    updateActiveCard({ ...activeCard, customHeaderColour: e.target.value });
                  }}
                  style={{
                    width: 40,
                    height: 28,
                    padding: 0,
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                />
                <Input
                  size="small"
                  value={activeCard.customHeaderColour || "#456664"}
                  onChange={(e) => {
                    updateActiveCard({ ...activeCard, customHeaderColour: e.target.value });
                  }}
                  style={{ width: 90, fontFamily: "monospace" }}
                />
              </Space>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: 4 }}>
                Used for weapon/ability headers and card borders
              </Text>
            </Form.Item>
          </Form>
        )}
      </Card>
    </>
  );
}
