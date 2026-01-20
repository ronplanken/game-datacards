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
      if (!window.indexedDB) {
        return;
      }

      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          // Failed to open database
        };

        request.onsuccess = (event) => {
          const database = request.result;
          setDb(database);
          setIsReady(true);
        };

        request.onupgradeneeded = (event) => {
          // TODO check which is correct
          const database = request.result;

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

  const saveImage = async (cardId, file) => {
    if (!db || !isReady) {
      throw new Error("IndexedDB is not ready");
    }

    if (!(file instanceof File)) {
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

      const request = store.put(imageData);

      request.onsuccess = () => {
        resolve(undefined);
      };

      request.onerror = () => {
        reject(new Error(`Failed to save image: ${request.error}`));
      };

      transaction.onerror = () => {
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
