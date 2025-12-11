import { Form, Switch, Input, Card, Space, Typography, Upload, Button, Slider, message } from "antd";
import { Upload as UploadIcon, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useIndexedDBImages } from "../../../Hooks/useIndexedDBImages";

const { Text } = Typography;

export function WarscrollStylingInfo() {
  const { activeCard, updateActiveCard, saveActiveCard } = useCardStorage();
  const { dataSource } = useDataSourceStorage();
  const { saveImage, deleteImage, getImageData, isReady } = useIndexedDBImages();
  const [localImageInfo, setLocalImageInfo] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadImageInfo = async () => {
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
        setLocalImageInfo(null);
      }
    };
    loadImageInfo();
  }, [activeCard?.uuid, isReady]);

  const handleImageUpload = async (file) => {
    const actualFile = file?.file || file;

    if (!actualFile) {
      message.error("No file selected");
      return false;
    }

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

      setTimeout(() => {
        saveActiveCard();
      }, 100);

      setLocalImageInfo({
        filename: actualFile.name,
        size: actualFile.size,
      });
      message.success("Image uploaded successfully");
    } catch (error) {
      console.error("Failed to upload image:", error);
      message.error("Failed to upload image");
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleDeleteLocalImage = async () => {
    if (!activeCard?.uuid) return;

    try {
      await deleteImage(activeCard.uuid);
      updateActiveCard({
        ...activeCard,
        hasLocalImage: false,
        localImageFilename: null,
      });

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
    <>
      <Card type={"inner"} title="Header Image" size="small" bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
        <Form size="small">
          <Form.Item label={"External Image URL"}>
            <Input
              type={"text"}
              value={activeCard.imageUrl}
              onChange={(e) => updateActiveCard({ ...activeCard, imageUrl: e.target.value })}
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
                    return false;
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

          <Form.Item label={"Image Opacity"}>
            <div style={{ paddingRight: "20px" }}>
              <Slider
                min={0}
                max={100}
                value={activeCard.imageOpacity ?? 30}
                onChange={(value) => updateActiveCard({ ...activeCard, imageOpacity: value })}
                marks={{
                  0: "0%",
                  30: "30%",
                  100: "100%",
                }}
                tooltip={{ formatter: (value) => `${value}%` }}
              />
            </div>
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

          <Form.Item label={"Vertical Position"}>
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

          <Form.Item label={"Image Scale"} style={{ marginBottom: 0 }}>
            <div style={{ paddingRight: "20px" }}>
              <Slider
                min={50}
                max={300}
                value={activeCard.imageScale ?? 100}
                onChange={(value) => updateActiveCard({ ...activeCard, imageScale: value })}
                marks={{
                  50: "50%",
                  100: "100%",
                  200: "200%",
                  300: "300%",
                }}
                tooltip={{ formatter: (value) => `${value}%` }}
              />
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Card
        type={"inner"}
        title="Custom Colours"
        size="small"
        bodyStyle={{ padding: activeCard.useCustomColours ? 16 : 0 }}
        extra={
          <Switch
            checked={activeCard.useCustomColours || false}
            onChange={(value) => {
              const cardFaction = dataSource?.data?.find((f) => f.id === activeCard?.faction_id);
              const updates = { useCustomColours: value };
              if (value && !activeCard.customBannerColour) {
                updates.customBannerColour = cardFaction?.colours?.banner || "#0f2b38";
              }
              if (value && !activeCard.customHeaderColour) {
                updates.customHeaderColour = cardFaction?.colours?.header || "#0f2b38";
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
                  value={activeCard.customBannerColour || "#0f2b38"}
                  onChange={(e) => updateActiveCard({ ...activeCard, customBannerColour: e.target.value })}
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
                  value={activeCard.customBannerColour || "#0f2b38"}
                  onChange={(e) => updateActiveCard({ ...activeCard, customBannerColour: e.target.value })}
                  style={{ width: 90, fontFamily: "monospace" }}
                />
              </Space>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: 4 }}>
                Used for section headers and primary accents
              </Text>
            </Form.Item>

            <Form.Item label={"Header Colour"} style={{ marginBottom: 0 }}>
              <Space>
                <input
                  type="color"
                  value={activeCard.customHeaderColour || "#0f2b38"}
                  onChange={(e) => updateActiveCard({ ...activeCard, customHeaderColour: e.target.value })}
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
                  value={activeCard.customHeaderColour || "#0f2b38"}
                  onChange={(e) => updateActiveCard({ ...activeCard, customHeaderColour: e.target.value })}
                  style={{ width: 90, fontFamily: "monospace" }}
                />
              </Space>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: 4 }}>
                Used for ability headers and secondary accents
              </Text>
            </Form.Item>
          </Form>
        )}
      </Card>
    </>
  );
}
