import { useMemo } from "react";
import { withCustomContent } from "../Helpers/customDetachments.helpers";
import { useCardStorage } from "./useCardStorage";
import { useSettingsStorage } from "./useSettingsStorage";

export const useFactionWithCustomContent = (faction) => {
  const { cardStorage } = useCardStorage();
  const { settings } = useSettingsStorage();
  const categories = cardStorage?.categories;
  const language = settings?.language;
  return useMemo(() => withCustomContent(faction, categories, language), [faction, categories, language]);
};
