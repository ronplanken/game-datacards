import { Button, Card, Form, Input, Slider, Space, Switch, Typography, Upload } from "antd";
import { Images, Trash2, Upload as UploadIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatFileSize } from "../../Helpers/generic.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useIndexedDBImages } from "../../Hooks/useIndexedDBImages";
import { message } from "../Toast/message";
import { FactionSymbolLibraryModal } from "../FactionSymbolLibraryModal";

const { Text } = Typography;

const MAX_SYMBOL_BYTES = 2 * 1024 * 1024;

/**
 * The faction symbol section of the card styling editor. Shared by the 10th and
 * 11th edition editors, which render the same panel against the same card
 * fields.
 */
export function FactionSymbolPanel() {
  const { activeCard, updateActiveCard, saveActiveCard } = useCardStorage();
  const { saveFactionSymbol, deleteFactionSymbol, getFactionSymbolData, isReady } = useIndexedDBImages();
  const [factionSymbolInfo, setFactionSymbolInfo] = useState(null);
  const [uploadingFactionSymbol, setUploadingFactionSymbol] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  useEffect(() => {
    const loadFactionSymbolInfo = async () => {
      if (activeCard?.uuid && isReady) {
        const symbolData = await getFactionSymbolData(activeCard.uuid);
        if (symbolData) {
          setFactionSymbolInfo({ filename: symbolData.filename, size: symbolData.size });
        } else {
          setFactionSymbolInfo(null);
        }
      } else {
        setFactionSymbolInfo(null);
      }
    };
    loadFactionSymbolInfo();
    // getFactionSymbolData is rebuilt on every render; depending on it loops.
  }, [activeCard?.uuid, isReady]);

  // Persisting the timestamp is what tells the card renderers to re-read the
  // stored symbol: swapping one on a card that already had a symbol changes
  // nothing else they watch.
  const applySymbol = (filename, size) => {
    const updatedCard = {
      ...activeCard,
      hasCustomFactionSymbol: true,
      customFactionSymbolFilename: filename,
      factionSymbolUpdatedAt: Date.now(),
    };
    updateActiveCard(updatedCard);
    saveActiveCard(updatedCard);
    setFactionSymbolInfo({ filename, size });
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

    if (actualFile.size > MAX_SYMBOL_BYTES) {
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
      applySymbol(actualFile.name, actualFile.size);
      message.success("Faction symbol uploaded successfully");
    } catch (error) {
      message.error("Failed to upload faction symbol");
    } finally {
      setUploadingFactionSymbol(false);
    }

    return false;
  };

  const handleSelectSavedSymbol = async (symbol) => {
    if (!activeCard?.uuid) {
      message.error("Please add this card to a category first");
      return;
    }

    try {
      // The stored blob carries no name of its own, so pass the original one on.
      await saveFactionSymbol(activeCard.uuid, symbol.image, symbol.filename);
      applySymbol(symbol.filename, symbol.size);
      setLibraryOpen(false);
      message.success("Faction symbol applied");
    } catch (error) {
      message.error("Failed to apply faction symbol");
    }
  };

  const handleDeleteFactionSymbol = async () => {
    if (!activeCard?.uuid) return;

    try {
      await deleteFactionSymbol(activeCard.uuid);
      const updatedCard = {
        ...activeCard,
        customFactionSymbolFilename: null,
        factionSymbolUpdatedAt: Date.now(),
      };
      updateActiveCard(updatedCard);
      saveActiveCard(updatedCard);
      setFactionSymbolInfo(null);
      message.success("Faction symbol removed");
    } catch (error) {
      message.error("Failed to delete faction symbol");
    }
  };

  return (
    <Card
      type={"inner"}
      title="Faction Symbol"
      size="small"
      bodyStyle={{ padding: activeCard.hasCustomFactionSymbol ? 16 : 0 }}
      extra={
        <Switch
          checked={activeCard.hasCustomFactionSymbol || false}
          onChange={(value) => {
            const updatedCard = { ...activeCard, hasCustomFactionSymbol: value };
            updateActiveCard(updatedCard);
            saveActiveCard(updatedCard);
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
              {factionSymbolInfo && (
                <Space>
                  <Text>
                    {factionSymbolInfo.filename} ({formatFileSize(factionSymbolInfo.size)})
                  </Text>
                  <Button icon={<Trash2 size={14} />} size="small" danger onClick={handleDeleteFactionSymbol}>
                    Remove
                  </Button>
                </Space>
              )}
              <Space>
                <Upload
                  accept="image/*,.svg"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleFactionSymbolUpload(file);
                    return false;
                  }}
                  disabled={!isReady}>
                  <Button icon={<UploadIcon size={14} />} loading={uploadingFactionSymbol} disabled={!isReady}>
                    {factionSymbolInfo ? "Replace" : "Upload Symbol"}
                  </Button>
                </Upload>
                <Button icon={<Images size={14} />} disabled={!isReady} onClick={() => setLibraryOpen(true)}>
                  Saved symbols
                </Button>
              </Space>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                SVG or PNG recommended. Symbol will be displayed in the faction badge.
              </Text>
            </Space>
          </Form.Item>

          <Form.Item label={"Original Colours"}>
            <Space>
              <Switch
                checked={activeCard.keepFactionSymbolColours || false}
                onChange={(value) => updateActiveCard({ ...activeCard, keepFactionSymbolColours: value })}
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Off matches the printed cards by flattening the symbol to black
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

          <FactionSymbolLibraryModal
            open={libraryOpen}
            onCancel={() => setLibraryOpen(false)}
            onSelect={handleSelectSavedSymbol}
          />
        </Form>
      )}
    </Card>
  );
}
