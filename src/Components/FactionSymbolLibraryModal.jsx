import { Empty, Modal, Spin, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { formatFileSize } from "../Helpers/generic.helpers";
import { useIndexedDBImages } from "../Hooks/useIndexedDBImages";

const { Text } = Typography;

/**
 * The same symbol uploaded onto several cards is stored once per card. Collapse
 * those into one entry so the library lists symbols, not cards.
 */
export const dedupeSymbols = (symbols = []) => {
  const byContent = new Map();
  symbols.forEach((symbol) => {
    const key = `${symbol.filename}|${symbol.size}|${symbol.type}`;
    const existing = byContent.get(key);
    if (existing) {
      existing.usedOnCards += 1;
      return;
    }
    byContent.set(key, { ...symbol, usedOnCards: 1 });
  });
  return [...byContent.values()];
};

/**
 * Picks one of the faction symbols already stored in this browser so it can be
 * reused on another card without hunting for the file again.
 */
export const FactionSymbolLibraryModal = ({ open, onCancel, onSelect }) => {
  const { listFactionSymbols, isReady } = useIndexedDBImages();
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !isReady) {
      return undefined;
    }

    let cancelled = false;
    const previewUrls = [];

    const load = async () => {
      setLoading(true);
      try {
        const stored = await listFactionSymbols();
        // Bail before creating any url: cleanup has already revoked whatever
        // previewUrls held, so anything made after it would never be released.
        if (cancelled) return;
        const entries = dedupeSymbols(stored).map((symbol) => {
          const previewUrl = URL.createObjectURL(symbol.image);
          previewUrls.push(previewUrl);
          return { ...symbol, previewUrl };
        });
        setSymbols(entries);
      } catch (error) {
        if (!cancelled) setSymbols([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // listFactionSymbols is rebuilt on every render of the hook; depending on it
    // would reload the library in a loop.
  }, [open, isReady]);

  return (
    <Modal open={open} onCancel={onCancel} footer={null} title="Saved faction symbols" width={520}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <Spin />
        </div>
      ) : symbols.length === 0 ? (
        <Empty description="You have not uploaded any faction symbols yet" />
      ) : (
        <>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
            Symbols you uploaded before, stored in this browser. Pick one to use it on this card.
          </Text>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
            {symbols.map((symbol) => (
              <button
                key={symbol.id}
                type="button"
                onClick={() => onSelect(symbol)}
                title={symbol.filename}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: 8,
                  border: "1px solid #d9d9d9",
                  borderRadius: 6,
                  background: "#fff",
                  cursor: "pointer",
                }}>
                <img
                  src={symbol.previewUrl}
                  alt={symbol.filename}
                  style={{ width: 64, height: 64, objectFit: "contain" }}
                />
                <Text ellipsis style={{ fontSize: 12, maxWidth: "100%" }}>
                  {symbol.filename}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {formatFileSize(symbol.size)}
                  {symbol.usedOnCards > 1 ? ` · on ${symbol.usedOnCards} cards` : ""}
                </Text>
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};
