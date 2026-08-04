import { CardView } from "./CardView";
import { GlossaryView } from "./GlossaryView";

/**
 * Owns the desktop app's middle panel. Switches between the available views;
 * "card" is the default and only renders a card when one is active. New views
 * (e.g. "glossary") are added as additional cases here.
 */
export const MiddlePanel = ({ view, ...cardProps }) => {
  if (view === "glossary") {
    return <GlossaryView />;
  }
  return <CardView {...cardProps} />;
};
