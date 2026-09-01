import React, { useEffect, useState } from "react";

const DB_NAME = "CardImagesDB";
const DB_VERSION = 1;
const STORE_NAME = "images";
// Faction symbols share the image store; the prefix keeps them apart from the
// card artwork stored under the bare card uuid.
export const FACTION_SYMBOL_PREFIX = "faction-";

/**
 * Picks the faction symbols out of raw image-store records, newest first, each
 * tagged with the uuid of the card it was uploaded for.
 */
export const toFactionSymbolEntries = (stored) =>
  (Array.isArray(stored) ? stored : [])
    .filter((entry) => typeof entry?.id === "string" && entry.id.startsWith(FACTION_SYMBOL_PREFIX))
    .map((entry) => ({
      id: entry.id,
      cardUuid: entry.id.slice(FACTION_SYMBOL_PREFIX.length),
      image: entry.image,
      filename: entry.filename,
      size: entry.size,
      type: entry.type,
      uploadedAt: entry.uploadedAt,
    }))
    .sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));

export function useIndexedDBImages() {
  const [db, setDb] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      if (!window.indexedDB) {
        return;
      }

      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          // Failed to open database
        };

        request.onsuccess = (event) => {
          const database = event.target.result;
          setDb(database);
          setIsReady(true);
        };

        request.onupgradeneeded = (event) => {
          const database = event.target.result;

          if (!database.objectStoreNames.contains(STORE_NAME)) {
            const objectStore = database.createObjectStore(STORE_NAME, { keyPath: "id" });
            objectStore.createIndex("uploadedAt", "uploadedAt", { unique: false });
          }
        };
      } catch (error) {
        // Error initializing database
      }
    };

    initDB();

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // `filename` is only needed when saving a Blob that carries no name of its own
  // — a symbol copied out of the library, for instance.
  const saveImage = async (cardId, file, filename) => {
    if (!db || !isReady) {
      throw new Error("IndexedDB is not ready");
    }

    if (!(file instanceof Blob)) {
      throw new Error("File must be a Blob or File object");
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // Store the actual Blob/File object, not a plain object
      const imageData = {
        id: cardId,
        image: file, // This must be a Blob/File, not a plain object
        filename: filename || file.name || "unknown",
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };

      const request = store.put(imageData);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to save image: ${request.error}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error}`));
      };
    });
  };

  const getImage = async (cardId) => {
    if (!db || !isReady) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(cardId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.image : null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get image: ${request.error}`));
      };
    });
  };

  const getImageData = async (cardId) => {
    if (!db || !isReady) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(cardId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get image data: ${request.error}`));
      };
    });
  };

  const deleteImage = async (cardId) => {
    if (!db || !isReady) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(cardId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete image: ${request.error}`));
      };
    });
  };

  const getImageUrl = async (cardId) => {
    try {
      const imageBlob = await getImage(cardId);
      if (imageBlob) {
        const url = URL.createObjectURL(imageBlob);
        return url;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Faction symbol methods - use prefixed keys to store separately from card images
  const getFactionSymbolKey = (cardId) => `${FACTION_SYMBOL_PREFIX}${cardId}`;

  const saveFactionSymbol = async (cardId, file, filename) => {
    return saveImage(getFactionSymbolKey(cardId), file, filename);
  };

  /**
   * Every faction symbol stored in this browser, newest first, each with the
   * uuid of the card it was uploaded for. Backs the library that lets a symbol
   * be reused on another card instead of being picked from disk again.
   */
  const listFactionSymbols = async () => {
    if (!db || !isReady) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(toFactionSymbolEntries(request.result));
      };

      request.onerror = () => {
        reject(new Error(`Failed to list faction symbols: ${request.error}`));
      };
    });
  };

  const getFactionSymbol = async (cardId) => {
    return getImage(getFactionSymbolKey(cardId));
  };

  const getFactionSymbolData = async (cardId) => {
    return getImageData(getFactionSymbolKey(cardId));
  };

  const deleteFactionSymbol = async (cardId) => {
    return deleteImage(getFactionSymbolKey(cardId));
  };

  const getFactionSymbolUrl = async (cardId) => {
    return getImageUrl(getFactionSymbolKey(cardId));
  };

  return {
    saveImage,
    getImage,
    getImageData,
    deleteImage,
    getImageUrl,
    saveFactionSymbol,
    listFactionSymbols,
    getFactionSymbol,
    getFactionSymbolData,
    deleteFactionSymbol,
    getFactionSymbolUrl,
    isReady,
  };
}
