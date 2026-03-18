import html2canvas from "html2canvas";

const defaultOptions = {
  useCORS: true,
  logging: false,
  allowTaint: false,
};

export const captureToBlob = async (element, { scale = 1.5 } = {}) => {
  const canvas = await html2canvas(element, { ...defaultOptions, scale });
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
};

export const captureToDataUrl = async (element) => {
  const canvas = await html2canvas(element, { ...defaultOptions, scale: 1 });
  return canvas.toDataURL("image/png");
};
