import { message } from "../Components/Toast/message";
import { captureToBlob, captureToDataUrl } from "../Helpers/screenshot.helpers";
import { useCallback } from "react";
import { useCardStorage } from "./useCardStorage";
import { useUmami } from "./useUmami";

export const useMobileSharing = () => {
  const { activeCard } = useCardStorage();
  const { trackEvent } = useUmami();
  const shareLink = useCallback(() => {
    if (navigator.share) {
      const data = { url: window.location.href, title: `Game-Datacards.eu - ${activeCard.name}` };
      if (navigator.canShare(data)) {
        navigator.share(data);
        trackEvent("mobile-share-link");
      } else {
        message.warn("Your browser is not supported to share this link");
      }
    } else {
      message.warn("Your browser is not supported to share this link");
    }
  }, [activeCard, trackEvent]);

  const htmlToImageConvert = useCallback(
    (divRef, overlayRef) => {
      divRef.current.style.display = "block";
      overlayRef.current.style.display = "block";

      if (navigator.share) {
        captureToBlob(divRef.current)
          .then((data) => {
            const fileData = {
              files: [
                new File([data], `${activeCard.name}.png`, {
                  type: data.type,
                }),
              ],
              title: `${activeCard.name}`,
            };
            if (navigator.canShare(fileData)) {
              navigator.share(fileData);
              trackEvent("mobile-share-image");
            } else {
              message.warn("Your browser is not supported to share this file");
            }
            divRef.current.style.display = "none";
            overlayRef.current.style.display = "none";
          })
          .catch((err) => {
            divRef.current.style.display = "none";
            overlayRef.current.style.display = "none";
            message.error(err);
          });
      } else {
        captureToDataUrl(divRef.current)
          .then((data) => {
            divRef.current.style.display = "none";
            overlayRef.current.style.display = "none";
            const link = document.createElement("a");
            link.download = `${activeCard.name}.png`;
            link.href = data;
            link.click();
            trackEvent("mobile-share-image");
          })
          .catch((err) => {
            divRef.current.style.display = "none";
            overlayRef.current.style.display = "none";
            message.error(err.toString());
          });
      }
    },
    [activeCard, trackEvent],
  );

  return { shareLink, htmlToImageConvert };
};
