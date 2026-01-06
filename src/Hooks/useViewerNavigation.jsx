import { useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDataSourceStorage } from "./useDataSourceStorage";
import { useCardStorage } from "./useCardStorage";
import { useSettingsStorage } from "./useSettingsStorage";

export function useViewerNavigation() {
  const { faction, unit, alliedFaction, alliedUnit, stratagem, spell, enhancement, rule } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { dataSource, selectedFaction, updateSelectedFaction, clearSelectedFaction } = useDataSourceStorage();
  const { activeCard, setActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();

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

    // Handle faction + unit route (but not other specialized routes)
    if (faction && !alliedFaction && !stratagem && !spell && !enhancement && !rule) {
      const foundFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === faction;
      });

      if (selectedFaction?.id !== foundFaction?.id) {
        updateSelectedFaction(foundFaction);
      }

      if (unit) {
        // Check if we have a pre-filtered card from a mobile list (passed via router state)
        const listCard = location.state?.listCard;
        if (listCard && listCard.name?.replaceAll(" ", "-").toLowerCase() === unit) {
          // Use the stored card with filtered weapons/wargear
          setActiveCard(listCard);
        } else {
          // Support both datasheets (40K) and warscrolls (AoS)
          const units = foundFaction?.datasheets || foundFaction?.warscrolls || [];
          let foundUnit = units.find((u) => {
            return u.name.replaceAll(" ", "-").toLowerCase() === unit;
          });

          // If not found and generic manifestations are enabled, search generic warscrolls
          if (!foundUnit && settings?.showGenericManifestations && dataSource?.genericData?.warscrolls) {
            foundUnit = dataSource.genericData.warscrolls.find((u) => {
              return u.name.replaceAll(" ", "-").toLowerCase() === unit;
            });
          }

          setActiveCard(foundUnit);
        }
      } else {
        setActiveCard();
      }
    }

    // Handle faction + stratagem route
    if (faction && !alliedFaction && stratagem) {
      let foundFaction;

      // Special handling for "core" faction - search basicStratagems across all factions
      if (faction === "core") {
        // First check if the currently selected faction has this basic stratagem
        const hasStratagem = selectedFaction?.basicStratagems?.some(
          (s) => s.name.replaceAll(" ", "-").toLowerCase() === stratagem,
        );
        if (hasStratagem) {
          foundFaction = selectedFaction;
        } else {
          // Fall back to finding the first faction that has it
          foundFaction = dataSource.data.find((f) => {
            return f.basicStratagems?.some((s) => s.name.replaceAll(" ", "-").toLowerCase() === stratagem);
          });
        }
      } else {
        foundFaction = dataSource.data.find((f) => {
          return f.name.toLowerCase().replaceAll(" ", "-") === faction;
        });
      }

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

    // Handle faction + enhancement route
    if (faction && !alliedFaction && enhancement) {
      const foundFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === faction;
      });

      if (selectedFaction?.id !== foundFaction?.id) {
        updateSelectedFaction(foundFaction);
      }

      const foundEnhancement = foundFaction?.enhancements?.find((e) => {
        return e.name.replaceAll(" ", "-").toLowerCase() === enhancement;
      });

      if (foundEnhancement) {
        setActiveCard({
          ...foundEnhancement,
          id: `enhancement-${foundEnhancement.name}`, // Add unique id for changeActiveCard comparison
          cardType: "enhancement",
          faction_id: foundFaction?.id,
          source: foundFaction?.datasheets ? "40k-10e" : "40k",
        });
      } else {
        setActiveCard();
      }
    }

    // Handle faction + rule route
    if (faction && !alliedFaction && rule) {
      const foundFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === faction;
      });

      if (selectedFaction?.id !== foundFaction?.id) {
        updateSelectedFaction(foundFaction);
      }

      // Search in army rules
      let foundRule = foundFaction?.rules?.army?.find((r) => {
        return r.name.replaceAll(" ", "-").toLowerCase() === rule;
      });

      // If not found, search in detachment rules
      if (!foundRule) {
        const detachmentRules = foundFaction?.rules?.detachment || [];
        for (const detachment of detachmentRules) {
          foundRule = detachment.rules?.find((r) => {
            return r.name.replaceAll(" ", "-").toLowerCase() === rule;
          });
          if (foundRule) {
            foundRule = { ...foundRule, detachment: detachment.detachment };
            break;
          }
        }
      }

      if (foundRule) {
        setActiveCard({
          ...foundRule,
          id: `rule-${foundRule.name}`, // Add unique id for changeActiveCard comparison
          cardType: "rule",
          faction_id: foundFaction?.id,
          source: foundFaction?.datasheets ? "40k-10e" : "40k",
        });
      } else {
        setActiveCard();
      }
    }

    // Handle faction + spell route (AoS - both manifestation lores and spell lores)
    if (faction && !alliedFaction && !stratagem && spell) {
      const foundFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === faction;
      });

      if (selectedFaction?.id !== foundFaction?.id) {
        updateSelectedFaction(foundFaction);
      }

      // Determine which type of lore based on URL path
      const isManifestationLore = location.pathname.includes("/manifestation-lore/");
      const isSpellLore = location.pathname.includes("/spell-lore/");

      let foundSpell = null;

      if (isManifestationLore) {
        // Search through faction manifestation lores
        const manifestationLores = foundFaction?.manifestationLores || [];
        for (const lore of manifestationLores) {
          const spellMatch = lore.spells?.find((s) => {
            return s.name.replaceAll(" ", "-").toLowerCase() === spell;
          });
          if (spellMatch) {
            foundSpell = {
              ...spellMatch,
              cardType: "spell",
              loreName: lore.name,
              faction_id: foundFaction?.id,
              source: "aos",
            };
            break;
          }
        }

        // If not found in faction lores and generic manifestations are enabled, search generic lores
        if (!foundSpell && settings?.showGenericManifestations && dataSource?.genericData?.manifestationLores) {
          for (const lore of dataSource.genericData.manifestationLores) {
            const spellMatch = lore.spells?.find((s) => {
              return s.name.replaceAll(" ", "-").toLowerCase() === spell;
            });
            if (spellMatch) {
              foundSpell = {
                ...spellMatch,
                cardType: "spell",
                loreName: lore.name,
                faction_id: "GENERIC",
                source: "aos",
              };
              break;
            }
          }
        }
      } else if (isSpellLore) {
        // Search through spell lores
        const spellLores = foundFaction?.lores || [];
        for (const lore of spellLores) {
          const spellMatch = lore.spells?.find((s) => {
            return s.name.replaceAll(" ", "-").toLowerCase() === spell;
          });
          if (spellMatch) {
            foundSpell = {
              ...spellMatch,
              cardType: "spell",
              loreName: lore.name,
              faction_id: foundFaction?.id,
              source: "aos",
            };
            break;
          }
        }
      }

      if (foundSpell) {
        setActiveCard(foundSpell);
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
  }, [
    faction,
    unit,
    alliedFaction,
    alliedUnit,
    stratagem,
    spell,
    enhancement,
    rule,
    dataSource,
    location.pathname,
    location.state,
    settings?.showGenericManifestations,
  ]);

  // Navigation helpers
  const navigateToFaction = useCallback(
    (factionName) => {
      navigate(`/viewer/${factionName.toLowerCase().replaceAll(" ", "-")}`);
    },
    [navigate],
  );

  const navigateToUnit = useCallback(
    (factionName, unitName) => {
      navigate(
        `/viewer/${factionName.toLowerCase().replaceAll(" ", "-")}/${unitName.replaceAll(" ", "-").toLowerCase()}`,
      );
    },
    [navigate],
  );

  const navigateToStratagem = useCallback(
    (factionName, stratagemName) => {
      navigate(
        `/viewer/${factionName.toLowerCase().replaceAll(" ", "-")}/stratagem/${stratagemName
          .replaceAll(" ", "-")
          .toLowerCase()}`,
      );
    },
    [navigate],
  );

  const navigateToAlliedUnit = useCallback(
    (mainFactionName, alliedFactionName, unitName) => {
      navigate(
        `/viewer/${mainFactionName.toLowerCase().replaceAll(" ", "-")}/allied/${alliedFactionName
          .toLowerCase()
          .replaceAll(" ", "-")}/${unitName.replaceAll(" ", "-").toLowerCase()}`,
      );
    },
    [navigate],
  );

  const navigateToManifestationLore = useCallback(
    (factionName, spellName) => {
      navigate(
        `/viewer/${factionName.toLowerCase().replaceAll(" ", "-")}/manifestation-lore/${spellName
          .replaceAll(" ", "-")
          .toLowerCase()}`,
      );
    },
    [navigate],
  );

  const navigateToSpellLore = useCallback(
    (factionName, spellName) => {
      navigate(
        `/viewer/${factionName.toLowerCase().replaceAll(" ", "-")}/spell-lore/${spellName
          .replaceAll(" ", "-")
          .toLowerCase()}`,
      );
    },
    [navigate],
  );

  // Mobile navigation helpers
  const navigateToMobileFaction = useCallback(
    (factionName) => {
      navigate(`/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}`);
    },
    [navigate],
  );

  const navigateToMobileUnit = useCallback(
    (factionName, unitName) => {
      navigate(
        `/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}/${unitName.replaceAll(" ", "-").toLowerCase()}`,
      );
    },
    [navigate],
  );

  const navigateToMobileStratagem = useCallback(
    (factionName, stratagemName) => {
      navigate(
        `/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}/stratagem/${stratagemName
          .replaceAll(" ", "-")
          .toLowerCase()}`,
      );
    },
    [navigate],
  );

  const navigateToMobileAlliedUnit = useCallback(
    (mainFactionName, alliedFactionName, unitName) => {
      navigate(
        `/mobile/${mainFactionName.toLowerCase().replaceAll(" ", "-")}/allied/${alliedFactionName
          .toLowerCase()
          .replaceAll(" ", "-")}/${unitName.replaceAll(" ", "-").toLowerCase()}`,
      );
    },
    [navigate],
  );

  const navigateToMobileEnhancement = useCallback(
    (factionName, enhancementName) => {
      navigate(
        `/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}/enhancement/${enhancementName
          .replaceAll(" ", "-")
          .toLowerCase()}`,
      );
    },
    [navigate],
  );

  const navigateToMobileRule = useCallback(
    (factionName, ruleName) => {
      navigate(
        `/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}/rule/${ruleName.replaceAll(" ", "-").toLowerCase()}`,
      );
    },
    [navigate],
  );

  return {
    // URL params
    faction,
    unit,
    alliedFaction,
    alliedUnit,
    stratagem,
    enhancement,
    rule,
    // State
    activeCard,
    selectedFaction,
    // Desktop navigation
    navigateToFaction,
    navigateToUnit,
    navigateToStratagem,
    navigateToAlliedUnit,
    navigateToManifestationLore,
    navigateToSpellLore,
    // Mobile navigation
    navigateToMobileFaction,
    navigateToMobileUnit,
    navigateToMobileStratagem,
    navigateToMobileAlliedUnit,
    navigateToMobileEnhancement,
    navigateToMobileRule,
  };
}
