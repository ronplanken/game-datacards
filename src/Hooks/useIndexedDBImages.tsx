import React, { useEffect, useState } from "react";

const DB_NAME = "CardImagesDB";
const DB_VERSION = 1;
const STORE_NAME = "images";

/**
 * TODO remove unused hook
 *
 * @export
 * @returns {{ saveImage: (cardId: any, file: any) => unknown; getImage: (cardId: any) => Promise<File>; getImageData: (cardId: any) => unknown; deleteImage: (cardId: any) => unknown; getImageUrl: (cardId: any) => unknown; saveFactionSymbol: (cardId: any, file: any) => unknown; ... 4 more ...; isReady: any; }}
 */
export function useIndexedDBImages() {
  const [db, setDb] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      console.log("[IndexedDB] Initializing database...");

      if (!window.indexedDB) {
        console.error("[IndexedDB] IndexedDB is not supported in this browser");
        return;
      }

      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.error("[IndexedDB] Failed to open database:", request.error);
        };

        request.onsuccess = function (event) {
          console.log(event.target, request.result);

          const database = request.result;
          console.log("[IndexedDB] Database opened successfully");
          setDb(database);
          setIsReady(true);
        };

        request.onupgradeneeded = (event) => {
          const database = request.result;
          console.log("[IndexedDB] Database upgrade needed");

          if (!database.objectStoreNames.contains(STORE_NAME)) {
            const objectStore = database.createObjectStore(STORE_NAME, { keyPath: "id" });
            objectStore.createIndex("uploadedAt", "uploadedAt", { unique: false });
            console.log("[IndexedDB] Created object store:", STORE_NAME);
          }
        };
      } catch (error) {
        console.error("[IndexedDB] Error initializing database:", error);
      }
    };

    initDB();

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  const saveImage = async (cardId, file) => {
    console.log("[IndexedDB] saveImage called with:", {
      cardId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      isFile: file instanceof File,
      isBlob: file instanceof Blob,
      isReady,
    });

    if (!db || !isReady) {
      console.error("[IndexedDB] Database not ready. db:", !!db, "isReady:", isReady);
      throw new Error("IndexedDB is not ready");
    }

    if (!(file instanceof File)) {
      console.error("[IndexedDB] File is not a Blob or File object:", file);
      throw new Error("File must be a Blob or File object");
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // Store the actual Blob/File object, not a plain object
      const imageData = {
        id: cardId,
        image: file, // This must be a Blob/File, not a plain object
        filename: file.name || "unknown",
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };

      console.log("[IndexedDB] Storing image data:", {
        id: imageData.id,
        filename: imageData.filename,
        imageIsBlob: imageData.image instanceof Blob,
      });

      const request = store.put(imageData);

      request.onsuccess = () => {
        console.log("[IndexedDB] Image saved successfully for card:", cardId);
        resolve(undefined);
      };

      request.onerror = () => {
        console.error("[IndexedDB] Failed to save image:", request.error);
        reject(new Error(`Failed to save image: ${request.error}`));
      };

      transaction.onerror = () => {
        console.error("[IndexedDB] Transaction failed:", transaction.error);
        reject(new Error(`Transaction failed: ${transaction.error}`));
      };
    });
  };

  const getImage = async (cardId): Promise<File> => {
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
        resolve(undefined);
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete image: ${request.error}`));
      };
    });
  };

  const getImageUrl = async (cardId) => {
    console.log("[IndexedDB] getImageUrl called for card:", cardId);
    try {
      const imageBlob = await getImage(cardId);
      if (imageBlob) {
        const url = URL.createObjectURL(imageBlob);
        console.log("[IndexedDB] Created object URL for card:", cardId, "URL:", url);
        return url;
      }
      console.log("[IndexedDB] No image found for card:", cardId);
      return null;
    } catch (error) {
      console.error("[IndexedDB] Error creating image URL:", error);
      return null;
    }
  };

  // Faction symbol methods - use prefixed keys to store separately from card images
  const getFactionSymbolKey = (cardId) => `faction-${cardId}`;

  const saveFactionSymbol = async (cardId, file) => {
    return saveImage(getFactionSymbolKey(cardId), file);
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
    getFactionSymbol,
    getFactionSymbolData,
    deleteFactionSymbol,
    getFactionSymbolUrl,
    isReady,
  };
}
