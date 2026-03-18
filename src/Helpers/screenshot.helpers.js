import { snapdom } from "@zumer/snapdom";

export const captureToBlob = async (element, { scale = 1.5 } = {}) => {
  const canvas = await snapdom.toCanvas(element, { scale });
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
};

export const captureToDataUrl = async (element) => {
  const canvas = await snapdom.toCanvas(element, { scale: 1 });
  return canvas.toDataURL("image/png");
};
