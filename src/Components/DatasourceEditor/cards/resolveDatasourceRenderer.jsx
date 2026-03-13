import { Ds40kStratagemCard } from "./Ds40kStratagemCard";
import { Ds40kEnhancementCard } from "./Ds40kEnhancementCard";
import { Ds40kRuleCard } from "./Ds40kRuleCard";
import { Ds40kUnitCard } from "./Ds40kUnitCard";
import { DsAosWarscrollCard } from "./DsAosWarscrollCard";

/**
 * Maps (baseSystem, baseType) to a native-styled datasource card component.
 * Returns null when no native renderer exists — caller should fall back to Custom* components.
 *
 * @param {string} baseSystem - The datasource base system (e.g. "40k-10e", "aos")
 * @param {string} baseType - The card type (e.g. "unit", "stratagem", "enhancement", "rule")
 * @returns {React.ComponentType|null}
 */
export const resolveDatasourceRenderer = (baseSystem, baseType) => {
  if (baseSystem === "40k-10e") {
    switch (baseType) {
      case "unit":
        return Ds40kUnitCard;
      case "stratagem":
        return Ds40kStratagemCard;
      case "enhancement":
        return Ds40kEnhancementCard;
      case "rule":
        return Ds40kRuleCard;
      default:
        return null;
    }
  }

  if (baseSystem === "aos") {
    switch (baseType) {
      case "unit":
        return DsAosWarscrollCard;
      default:
        return null;
    }
  }

  return null;
};
