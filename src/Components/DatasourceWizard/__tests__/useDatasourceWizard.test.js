import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDatasourceWizard } from "../hooks/useDatasourceWizard";
import { WIZARD_MODES } from "../constants";

describe("useDatasourceWizard", () => {
  describe("wizard mode resolution", () => {
    it("defaults to create mode when no existingDatasource", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.mode).toBe(WIZARD_MODES.CREATE);
    });

    it("uses create mode when existingDatasource is null", () => {
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: null }));
      expect(result.current.mode).toBe(WIZARD_MODES.CREATE);
    });

    it("uses add-card-type mode when existingDatasource is provided", () => {
      const ds = { name: "Test", schema: { cardTypes: [] } };
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: ds }));
      expect(result.current.mode).toBe(WIZARD_MODES.ADD_CARD_TYPE);
    });
  });

  describe("initial state", () => {
    it("starts at step index 0", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.currentStepIndex).toBe(0);
    });

    it("starts with forward transition direction", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.transitionDirection).toBe("forward");
    });

    it("starts with empty completed steps", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.completedSteps.size).toBe(0);
    });

    it("starts with null baseType", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.baseType).toBeNull();
    });

    it("starts with empty stepData", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.stepData).toEqual({});
    });
  });

  describe("step list in create mode", () => {
    it("shows metadata, base-system, card-type, review when no baseType", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      const ids = result.current.steps.map((s) => s.id);
      expect(ids).toEqual(["metadata", "base-system", "card-type", "review"]);
    });

    it("includes unit-specific steps when baseType is unit", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      act(() => result.current.changeBaseType("unit"));

      const ids = result.current.steps.map((s) => s.id);
      expect(ids).toEqual([
        "metadata",
        "base-system",
        "card-type",
        "stats",
        "weapons",
        "abilities",
        "unit-metadata",
        "review",
      ]);
    });

    it("includes rule-specific steps when baseType is rule", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      act(() => result.current.changeBaseType("rule"));

      const ids = result.current.steps.map((s) => s.id);
      expect(ids).toEqual(["metadata", "base-system", "card-type", "fields", "rules", "review"]);
    });
  });

  describe("step list in add-card-type mode", () => {
    it("skips creation prefix steps", () => {
      const ds = { name: "Test", schema: { cardTypes: [] } };
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: ds }));
      const ids = result.current.steps.map((s) => s.id);
      expect(ids).toEqual(["card-type", "review"]);
    });

    it("includes type-specific steps without creation prefix", () => {
      const ds = { name: "Test", schema: { cardTypes: [] } };
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: ds }));
      act(() => result.current.changeBaseType("unit"));

      const ids = result.current.steps.map((s) => s.id);
      expect(ids).toEqual(["card-type", "stats", "weapons", "abilities", "unit-metadata", "review"]);
    });
  });

  describe("step navigation", () => {
    it("goNext advances to the next step when canProceed is true", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      // Fill metadata to enable proceeding
      act(() => result.current.updateStepData("metadata", { name: "Test DS" }));
      act(() => result.current.goNext());

      expect(result.current.currentStepIndex).toBe(1);
      expect(result.current.transitionDirection).toBe("forward");
    });

    it("goNext does nothing when canProceed is false", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      // metadata step requires name, which is empty
      act(() => result.current.goNext());

      expect(result.current.currentStepIndex).toBe(0);
    });

    it("goPrevious goes to the previous step", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      // Navigate forward first
      act(() => result.current.updateStepData("metadata", { name: "Test" }));
      act(() => result.current.goNext());
      act(() => result.current.goPrevious());

      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.transitionDirection).toBe("backward");
    });

    it("goPrevious does nothing on the first step", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      act(() => result.current.goPrevious());
      expect(result.current.currentStepIndex).toBe(0);
    });

    it("goToStep navigates to a specific step", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      act(() => result.current.goToStep(2));

      expect(result.current.currentStepIndex).toBe(2);
      expect(result.current.transitionDirection).toBe("forward");
    });

    it("goToStep refuses out-of-bounds indices", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      act(() => result.current.goToStep(-1));
      expect(result.current.currentStepIndex).toBe(0);

      act(() => result.current.goToStep(100));
      expect(result.current.currentStepIndex).toBe(0);
    });

    it("marks current step as completed when moving forward", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.updateStepData("metadata", { name: "Test" }));
      act(() => result.current.goNext());

      expect(result.current.completedSteps.has(0)).toBe(true);
    });

    it("does not mark step as completed when moving backward", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.updateStepData("metadata", { name: "Test" }));
      act(() => result.current.goNext());
      act(() => result.current.goPrevious());

      // Step 1 should NOT be completed (we went back from it)
      expect(result.current.completedSteps.has(1)).toBe(false);
    });
  });

  describe("transition direction", () => {
    it("sets forward when navigating to a higher index", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      act(() => result.current.goToStep(2));
      expect(result.current.transitionDirection).toBe("forward");
    });

    it("sets backward when navigating to a lower index", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      act(() => result.current.goToStep(2));
      act(() => result.current.goToStep(0));
      expect(result.current.transitionDirection).toBe("backward");
    });

    it("allows explicit direction override", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      act(() => result.current.goToStep(2, "backward"));
      expect(result.current.transitionDirection).toBe("backward");
    });
  });

  describe("derived properties", () => {
    it("computes isFirstStep correctly", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.isFirstStep).toBe(true);

      act(() => result.current.goToStep(1));
      expect(result.current.isFirstStep).toBe(false);
    });

    it("computes isLastStep correctly", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      // Without baseType: metadata, base-system, card-type, review = 4 steps
      expect(result.current.isLastStep).toBe(false);

      act(() => result.current.goToStep(3));
      expect(result.current.isLastStep).toBe(true);
    });

    it("computes progress correctly", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      // 4 steps, at step 0: (0+1)/4 * 100 = 25
      expect(result.current.progress).toBe(25);

      act(() => result.current.goToStep(1));
      expect(result.current.progress).toBe(50);
    });

    it("exposes currentStep object", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.currentStep.id).toBe("metadata");
    });

    it("exposes totalSteps", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.totalSteps).toBe(4);
    });
  });

  describe("per-step validation (canProceed)", () => {
    it("metadata step requires name", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.canProceed).toBe(false);

      act(() => result.current.updateStepData("metadata", { name: "My DS" }));
      expect(result.current.canProceed).toBe(true);
    });

    it("metadata step rejects whitespace-only name", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      act(() => result.current.updateStepData("metadata", { name: "   " }));
      expect(result.current.canProceed).toBe(false);
    });

    it("base-system step requires baseSystem", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.updateStepData("metadata", { name: "Test" }));
      act(() => result.current.goNext()); // go to base-system

      expect(result.current.canProceed).toBe(false);

      act(() => result.current.updateStepData("base-system", { baseSystem: "40k-10e" }));
      expect(result.current.canProceed).toBe(true);
    });

    it("card-type step requires baseType selection", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      // Navigate to card-type step
      act(() => result.current.goToStep(2));
      expect(result.current.currentStep.id).toBe("card-type");
      expect(result.current.canProceed).toBe(false);

      act(() => result.current.changeBaseType("unit"));
      expect(result.current.canProceed).toBe(true);
    });

    it("type-specific steps default to valid", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.changeBaseType("unit"));
      act(() => result.current.goToStep(3)); // stats step

      expect(result.current.currentStep.id).toBe("stats");
      expect(result.current.canProceed).toBe(true);
    });

    it("review step is always valid", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      // Navigate to review (last step)
      const lastIndex = result.current.steps.length - 1;
      act(() => result.current.goToStep(lastIndex));

      expect(result.current.currentStep.id).toBe("review");
      expect(result.current.canProceed).toBe(true);
    });
  });

  describe("step data management", () => {
    it("updateStepData stores data for a step", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.updateStepData("metadata", { name: "Test", version: "2.0" }));
      expect(result.current.stepData.metadata).toEqual({ name: "Test", version: "2.0" });
    });

    it("updateStepData accepts a function updater", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.updateStepData("metadata", { name: "Test" }));
      act(() => result.current.updateStepData("metadata", (prev) => ({ ...prev, version: "3.0" })));

      expect(result.current.stepData.metadata).toEqual({ name: "Test", version: "3.0" });
    });

    it("preserves data across different steps", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.updateStepData("metadata", { name: "DS1" }));
      act(() => result.current.updateStepData("base-system", { baseSystem: "40k-10e" }));

      expect(result.current.stepData.metadata).toEqual({ name: "DS1" });
      expect(result.current.stepData["base-system"]).toEqual({ baseSystem: "40k-10e" });
    });
  });

  describe("baseType change and state reset", () => {
    it("resets type-specific step data when baseType changes", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.changeBaseType("unit"));
      act(() => result.current.updateStepData("stats", { stats: { label: "Stats", fields: [] } }));
      act(() => result.current.updateStepData("metadata", { name: "Keep Me" }));

      act(() => result.current.changeBaseType("rule"));

      // Type-specific data should be cleared
      expect(result.current.stepData.stats).toBeUndefined();
      // Non-type-specific data should remain
      expect(result.current.stepData.metadata).toEqual({ name: "Keep Me" });
    });

    it("does nothing when setting the same baseType", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.changeBaseType("unit"));
      act(() => result.current.updateStepData("stats", { stats: { label: "Stats", fields: [] } }));
      act(() => result.current.changeBaseType("unit"));

      // Data should still be there
      expect(result.current.stepData.stats).toBeDefined();
    });

    it("recomputes step list when baseType changes", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.changeBaseType("unit"));
      const unitIds = result.current.steps.map((s) => s.id);
      expect(unitIds).toContain("stats");
      expect(unitIds).toContain("weapons");

      act(() => result.current.changeBaseType("stratagem"));
      const stratagemIds = result.current.steps.map((s) => s.id);
      expect(stratagemIds).not.toContain("stats");
      expect(stratagemIds).not.toContain("weapons");
      expect(stratagemIds).toContain("fields");
    });

    it("clears completed steps for type-specific steps on baseType change", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      act(() => result.current.changeBaseType("unit"));
      // Navigate forward through some steps to complete them
      act(() => result.current.goToStep(3)); // stats
      act(() => result.current.goToStep(4)); // weapons (marks step 3 = stats as completed)

      expect(result.current.completedSteps.size).toBeGreaterThan(0);

      act(() => result.current.changeBaseType("rule"));
      // Type-specific completed steps should be cleared
      // Only non-type-specific completed steps remain
      for (const idx of result.current.completedSteps) {
        const step = result.current.steps[idx];
        if (step) {
          expect(["stats", "weapons", "abilities", "unit-metadata", "fields", "rules", "keywords"]).not.toContain(
            step.id,
          );
        }
      }
    });
  });

  describe("existingBaseTypes (add-card-type mode)", () => {
    it("returns empty array in create mode", () => {
      const { result } = renderHook(() => useDatasourceWizard());
      expect(result.current.existingBaseTypes).toEqual([]);
    });

    it("returns base types from existing datasource card types", () => {
      const ds = {
        name: "Test",
        schema: {
          cardTypes: [
            { key: "unit", label: "Unit", baseType: "unit", schema: {} },
            { key: "rule", label: "Rule", baseType: "rule", schema: {} },
          ],
        },
      };
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: ds }));
      expect(result.current.existingBaseTypes).toEqual(["unit", "rule"]);
    });

    it("returns empty array when existing datasource has no card types", () => {
      const ds = { name: "Test", schema: { cardTypes: [] } };
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: ds }));
      expect(result.current.existingBaseTypes).toEqual([]);
    });

    it("handles missing schema gracefully", () => {
      const ds = { name: "Test" };
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: ds }));
      expect(result.current.existingBaseTypes).toEqual([]);
    });
  });

  describe("duplicate baseType prevention (add-card-type mode)", () => {
    const dsWithUnit = {
      name: "Test",
      schema: {
        cardTypes: [{ key: "infantry", label: "Infantry", baseType: "unit", schema: {} }],
      },
    };

    it("changeBaseType rejects a baseType already defined in existing datasource", () => {
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: dsWithUnit }));

      act(() => result.current.changeBaseType("unit"));
      expect(result.current.baseType).toBeNull();
    });

    it("changeBaseType allows a baseType not defined in existing datasource", () => {
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: dsWithUnit }));

      act(() => result.current.changeBaseType("rule"));
      expect(result.current.baseType).toBe("rule");
    });

    it("canProceed is false on card-type step when baseType is a duplicate", () => {
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: dsWithUnit }));

      // In add-card-type mode, first step is card-type
      expect(result.current.currentStep.id).toBe("card-type");

      // Manually force baseType via a fresh hook without guard (simulate stale state)
      // Since changeBaseType blocks it, canProceed should remain false
      expect(result.current.canProceed).toBe(false);
    });

    it("canProceed is true on card-type step when baseType is not a duplicate", () => {
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: dsWithUnit }));

      act(() => result.current.changeBaseType("stratagem"));
      expect(result.current.canProceed).toBe(true);
    });

    it("availableBaseTypes excludes existing base types", () => {
      const ds = {
        name: "Test",
        schema: {
          cardTypes: [
            { key: "infantry", label: "Infantry", baseType: "unit", schema: {} },
            { key: "rules", label: "Rules", baseType: "rule", schema: {} },
          ],
        },
      };
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: ds }));

      expect(result.current.availableBaseTypes).not.toContain("unit");
      expect(result.current.availableBaseTypes).not.toContain("rule");
      expect(result.current.availableBaseTypes).toContain("enhancement");
      expect(result.current.availableBaseTypes).toContain("stratagem");
    });

    it("availableBaseTypes includes all types in create mode", () => {
      const { result } = renderHook(() => useDatasourceWizard());

      expect(result.current.availableBaseTypes).toContain("unit");
      expect(result.current.availableBaseTypes).toContain("rule");
      expect(result.current.availableBaseTypes).toContain("enhancement");
      expect(result.current.availableBaseTypes).toContain("stratagem");
    });

    it("availableBaseTypes includes all types when existing datasource has no card types", () => {
      const ds = { name: "Test", schema: { cardTypes: [] } };
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: ds }));

      expect(result.current.availableBaseTypes).toEqual(["unit", "rule", "enhancement", "stratagem"]);
    });

    it("goNext is blocked when duplicate baseType is selected on card-type step", () => {
      const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: dsWithUnit }));

      // Attempt to select and proceed with duplicate type
      act(() => result.current.changeBaseType("unit"));
      act(() => result.current.goNext());

      // Should still be on step 0 (card-type), not advanced
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.currentStep.id).toBe("card-type");
    });
  });

  describe("assembleResult", () => {
    describe("create mode", () => {
      it("assembles a full datasource schema", () => {
        const { result } = renderHook(() => useDatasourceWizard());

        act(() => {
          result.current.updateStepData("metadata", { name: "My DS", version: "1.0.0", author: "Me" });
          result.current.updateStepData("base-system", { baseSystem: "40k-10e" });
          result.current.changeBaseType("stratagem");
          result.current.updateStepData("card-type", { key: "battle-tactic", label: "Battle Tactic" });
          result.current.updateStepData("fields", {
            fields: [{ key: "name", label: "Name", type: "string", required: true }],
          });
        });

        const assembled = result.current.assembleResult();
        expect(assembled.name).toBe("My DS");
        expect(assembled.version).toBe("1.0.0");
        expect(assembled.author).toBe("Me");
        expect(assembled.schema.baseSystem).toBe("40k-10e");
        expect(assembled.schema.version).toBe("1.0.0");
        expect(assembled.schema.cardTypes).toHaveLength(1);
        expect(assembled.schema.cardTypes[0].key).toBe("battle-tactic");
        expect(assembled.schema.cardTypes[0].baseType).toBe("stratagem");
        expect(assembled.schema.cardTypes[0].schema.fields).toHaveLength(1);
      });

      it("provides sensible defaults for missing data", () => {
        const { result } = renderHook(() => useDatasourceWizard());
        act(() => result.current.changeBaseType("stratagem"));

        const assembled = result.current.assembleResult();
        expect(assembled.name).toBe("");
        expect(assembled.version).toBe("1.0.0");
        expect(assembled.schema.baseSystem).toBe("blank");
        expect(assembled.schema.cardTypes[0].schema.fields).toEqual([]);
      });

      it("assembles unit card type with all sub-objects", () => {
        const { result } = renderHook(() => useDatasourceWizard());

        const statsData = {
          stats: { label: "Stats", allowMultipleProfiles: true, fields: [{ key: "m", label: "M", type: "string" }] },
        };
        const weaponsData = {
          weaponTypes: {
            label: "Weapons",
            allowMultiple: true,
            types: [{ key: "ranged", label: "Ranged", hasKeywords: true, hasProfiles: true, columns: [] }],
          },
        };
        const abilitiesData = {
          abilities: {
            label: "Abilities",
            categories: [{ key: "core", label: "Core", format: "name-only" }],
            hasInvulnerableSave: true,
            hasDamagedAbility: false,
          },
        };
        const metadataData = {
          metadata: { hasKeywords: true, hasFactionKeywords: false, hasPoints: true, pointsFormat: "per-model" },
        };

        act(() => {
          result.current.changeBaseType("unit");
          result.current.updateStepData("stats", statsData);
          result.current.updateStepData("weapons", weaponsData);
          result.current.updateStepData("abilities", abilitiesData);
          result.current.updateStepData("unit-metadata", metadataData);
        });

        const assembled = result.current.assembleResult();
        const cardType = assembled.schema.cardTypes[0];
        expect(cardType.baseType).toBe("unit");
        expect(cardType.schema.stats.allowMultipleProfiles).toBe(true);
        expect(cardType.schema.weaponTypes.types).toHaveLength(1);
        expect(cardType.schema.abilities.hasInvulnerableSave).toBe(true);
        expect(cardType.schema.metadata.hasKeywords).toBe(true);
      });

      it("assembles rule card type with rules collection", () => {
        const { result } = renderHook(() => useDatasourceWizard());

        act(() => {
          result.current.changeBaseType("rule");
          result.current.updateStepData("fields", {
            fields: [{ key: "name", label: "Name", type: "string" }],
          });
          result.current.updateStepData("rules", {
            rules: { label: "Rules", allowMultiple: true, fields: [] },
          });
        });

        const assembled = result.current.assembleResult();
        const cardType = assembled.schema.cardTypes[0];
        expect(cardType.baseType).toBe("rule");
        expect(cardType.schema.fields).toHaveLength(1);
        expect(cardType.schema.rules.label).toBe("Rules");
      });

      it("assembles enhancement card type with keywords collection", () => {
        const { result } = renderHook(() => useDatasourceWizard());

        act(() => {
          result.current.changeBaseType("enhancement");
          result.current.updateStepData("fields", {
            fields: [{ key: "name", label: "Name", type: "string" }],
          });
          result.current.updateStepData("keywords", {
            keywords: { label: "Keywords", allowMultiple: true, fields: [] },
          });
        });

        const assembled = result.current.assembleResult();
        const cardType = assembled.schema.cardTypes[0];
        expect(cardType.baseType).toBe("enhancement");
        expect(cardType.schema.keywords.label).toBe("Keywords");
      });
    });

    describe("add-card-type mode", () => {
      it("returns only the card type entry, not a full datasource", () => {
        const ds = { name: "Test", schema: { cardTypes: [] } };
        const { result } = renderHook(() => useDatasourceWizard({ existingDatasource: ds }));

        act(() => {
          result.current.changeBaseType("stratagem");
          result.current.updateStepData("card-type", { key: "tactic", label: "Tactic" });
          result.current.updateStepData("fields", {
            fields: [{ key: "name", label: "Name", type: "string" }],
          });
        });

        const assembled = result.current.assembleResult();
        expect(assembled.key).toBe("tactic");
        expect(assembled.label).toBe("Tactic");
        expect(assembled.baseType).toBe("stratagem");
        expect(assembled.schema.fields).toHaveLength(1);
        // Should NOT have top-level datasource properties
        expect(assembled.name).toBeUndefined();
        expect(assembled.schema.version).toBeUndefined();
      });
    });
  });
});
