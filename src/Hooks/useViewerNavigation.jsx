import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "./useDataSourceStorage";
import { useCardStorage } from "./useCardStorage";

export function useViewerNavigation() {
  const { faction, unit, alliedFaction, alliedUnit, stratagem } = useParams();
  const navigate = useNavigate();
  const { dataSource, selectedFaction, updateSelectedFaction, clearSelectedFaction } = useDataSourceStorage();
  const { activeCard, setActiveCard } = useCardStorage();

  // Parse URL and sync with state
  useEffect(() => {
    if (!dataSource?.data?.length) return;

    // Handle no faction in URL - clear selection (for mobile welcome screen)
    // Use clearSelectedFaction to preserve the last faction in settings for "continue to" feature
    if (!faction) {
      if (selectedFaction) {
        clearSelectedFaction();
      }
      setActiveCard();
      return;
    }

    // Handle faction + unit route
    if (faction && !alliedFaction && !stratagem) {
      const foundFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === faction;
      });

      if (selectedFaction?.id !== foundFaction?.id) {
        updateSelectedFaction(foundFaction);
      }

      if (unit) {
        // Support both datasheets (40K) and warscrolls (AoS)
        const units = foundFaction?.datasheets || foundFaction?.warscrolls || [];
        const foundUnit = units.find((u) => {
          return u.name.replaceAll(" ", "-").toLowerCase() === unit;
        });
        setActiveCard(foundUnit);
      } else {
        setActiveCard();
      }
    }

    // Handle faction + stratagem route
    if (faction && !alliedFaction && stratagem) {
      const foundFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === faction;
      });

      if (selectedFaction?.id !== foundFaction?.id) {
        updateSelectedFaction(foundFaction);
      }

      if (stratagem) {
        let foundStratagem = foundFaction?.stratagems?.find((u) => {
          return u.name.replaceAll(" ", "-").toLowerCase() === stratagem;
        });

        if (!foundStratagem) {
          foundStratagem = foundFaction?.basicStratagems?.find((u) => {
            return u.name.replaceAll(" ", "-").toLowerCase() === stratagem;
          });
          if (foundStratagem) {
            foundStratagem = { ...foundStratagem, faction_id: foundFaction.id };
          }
        }

        setActiveCard(foundStratagem);
      } else {
        setActiveCard();
      }
    }

    // Handle faction + allied faction route
    if (faction && alliedFaction) {
      const foundFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === faction;
      });

      if (selectedFaction?.id !== foundFaction?.id) {
        updateSelectedFaction(foundFaction);
      }

      const foundAlliedFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === alliedFaction;
      });

      if (alliedUnit) {
        // Support both datasheets (40K) and warscrolls (AoS)
        const units = foundAlliedFaction?.datasheets || foundAlliedFaction?.warscrolls || [];
        const foundUnit = units.find((u) => {
          return u.name.replaceAll(" ", "-").toLowerCase() === alliedUnit;
        });
        setActiveCard(foundUnit);
      } else {
        setActiveCard();
      }
    }
  }, [faction, unit, alliedFaction, alliedUnit, stratagem, dataSource]);

  // Navigation helpers
  const navigateToFaction = useCallback(
    (factionName) => {
      navigate(`/viewer/${factionName.toLowerCase().replaceAll(" ", "-")}`);
    },
    [navigate]
  );

  const navigateToUnit = useCallback(
    (factionName, unitName) => {
      navigate(
        `/viewer/${factionName.toLowerCase().replaceAll(" ", "-")}/${unitName.replaceAll(" ", "-").toLowerCase()}`
      );
    },
    [navigate]
  );

  const navigateToStratagem = useCallback(
    (factionName, stratagemName) => {
      navigate(
        `/viewer/${factionName.toLowerCase().replaceAll(" ", "-")}/stratagem/${stratagemName
          .replaceAll(" ", "-")
          .toLowerCase()}`
      );
    },
    [navigate]
  );

  const navigateToAlliedUnit = useCallback(
    (mainFactionName, alliedFactionName, unitName) => {
      navigate(
        `/viewer/${mainFactionName.toLowerCase().replaceAll(" ", "-")}/allied/${alliedFactionName
          .toLowerCase()
          .replaceAll(" ", "-")}/${unitName.replaceAll(" ", "-").toLowerCase()}`
      );
    },
    [navigate]
  );

  // Mobile navigation helpers
  const navigateToMobileFaction = useCallback(
    (factionName) => {
      navigate(`/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}`);
    },
    [navigate]
  );

  const navigateToMobileUnit = useCallback(
    (factionName, unitName) => {
      navigate(
        `/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}/${unitName.replaceAll(" ", "-").toLowerCase()}`
      );
    },
    [navigate]
  );

  const navigateToMobileStratagem = useCallback(
    (factionName, stratagemName) => {
      navigate(
        `/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}/stratagem/${stratagemName
          .replaceAll(" ", "-")
          .toLowerCase()}`
      );
    },
    [navigate]
  );

  const navigateToMobileAlliedUnit = useCallback(
    (mainFactionName, alliedFactionName, unitName) => {
      navigate(
        `/mobile/${mainFactionName.toLowerCase().replaceAll(" ", "-")}/allied/${alliedFactionName
          .toLowerCase()
          .replaceAll(" ", "-")}/${unitName.replaceAll(" ", "-").toLowerCase()}`
      );
    },
    [navigate]
  );

  return {
    // URL params
    faction,
    unit,
    alliedFaction,
    alliedUnit,
    stratagem,
    // State
    activeCard,
    selectedFaction,
    // Desktop navigation
    navigateToFaction,
    navigateToUnit,
    navigateToStratagem,
    navigateToAlliedUnit,
    // Mobile navigation
    navigateToMobileFaction,
    navigateToMobileUnit,
    navigateToMobileStratagem,
    navigateToMobileAlliedUnit,
  };
}
