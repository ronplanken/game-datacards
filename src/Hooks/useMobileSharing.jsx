import { message } from "../Components/Toast/message";
import { toBlob, toPng } from "html-to-image";
import { useCallback } from "react";
import { useCardStorage } from "./useCardStorage";

export const useMobileSharing = () => {
  const { activeCard } = useCardStorage();
  const shareLink = useCallback(() => {
    if (navigator.share) {
      const data = { url: window.location.href, title: `Game-Datacards.eu - ${activeCard.name}` };
      if (navigator.canShare(data)) {
        navigator.share(data);
      } else {
        message.warn("Your browser is not supported to share this link");
      }
    } else {
      message.warn("Your browser is not supported to share this link");
    }
  }, [activeCard]);

  const htmlToImageConvert = useCallback(
    (divRef, overlayRef) => {
      divRef.current.style.display = "block";
      overlayRef.current.style.display = "block";

      if (navigator.share) {
        toBlob(divRef.current, { cacheBust: false })
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
        toPng(divRef.current, { cacheBust: false })
          .then((data) => {
            divRef.current.style.display = "none";
            overlayRef.current.style.display = "none";
            const link = document.createElement("a");
            link.download = `${activeCard.name}.png`;
            link.href = data;
            link.click();
          })
          .catch((err) => {
            divRef.current.style.display = "none";
            overlayRef.current.style.display = "none";
            message.error(err.toString());
          });
      }
    },
    [activeCard]
  );

  return { shareLink, htmlToImageConvert };
};
