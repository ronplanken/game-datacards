import { snapdom } from "@zumer/snapdom";

export const captureToBlob = async (element, { scale = 1.5 } = {}) => {
  return snapdom.toBlob(element, { type: "png", scale });
};

export const captureToDataUrl = async (element) => {
  const img = await snapdom.toPng(element, { scale: 1 });
  return img.src;
};
