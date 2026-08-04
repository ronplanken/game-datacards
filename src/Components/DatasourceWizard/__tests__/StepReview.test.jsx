import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepReview } from "../steps/StepReview";
import { WIZARD_MODES } from "../constants";

/**
 * Creates a mock wizard object with assembleResult returning the given result.
 */
const createMockWizard = (overrides = {}) => {
  const defaultResult = {
    name: "My Datasource",
    version: "1.0.0",
    author: "Test Author",
    schema: {
      version: "1.0.0",
      baseSystem: "40k-10e",
      cardTypes: [
        {
          key: "infantry",
          label: "Infantry",
          baseType: "unit",
          schema: {
            stats: {
              label: "Stats",
              allowMultipleProfiles: false,
              fields: [
                { key: "m", label: "M", type: "string", displayOrder: 1 },
                { key: "t", label: "T", type: "string", displayOrder: 2 },
              ],
            },
            weaponTypes: {
              label: "Weapon Types",
              allowMultiple: true,
              types: [{ key: "ranged", label: "Ranged", columns: [] }],
            },
            abilities: {
              label: "Abilities",
              categories: [{ key: "core", label: "Core", format: "name-only" }],
            },
            metadata: {
              hasKeywords: true,
              hasFactionKeywords: true,
              hasPoints: false,
              pointsFormat: "per-model",
            },
          },
        },
      ],
    },
  };

  return {
    mode: WIZARD_MODES.CREATE,
    baseType: "unit",
    stepData: {},
    assembleResult: vi.fn(() => overrides.result || defaultResult),
    ...overrides,
  };
};

describe("StepReview", () => {
  it("renders the step title and description", () => {
    const wizard = createMockWizard();
    render(<StepReview wizard={wizard} />);

    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText(/Review your datasource configuration/)).toBeInTheDocument();
  });

  it("has the correct test id on the root element", () => {
    const wizard = createMockWizard();
    render(<StepReview wizard={wizard} />);

    expect(screen.getByTestId("dsw-step-review")).toBeInTheDocument();
  });

  it("calls assembleResult from the wizard", () => {
    const wizard = createMockWizard();
    render(<StepReview wizard={wizard} />);

    expect(wizard.assembleResult).toHaveBeenCalled();
  });

  describe("create mode", () => {
    it("shows datasource metadata section", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-metadata")).toBeInTheDocument();
    });

    it("displays datasource name", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-name")).toHaveTextContent("My Datasource");
    });

    it("displays version", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-version")).toHaveTextContent("1.0.0");
    });

    it("displays author", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-author")).toHaveTextContent("Test Author");
    });

    it("displays base system label", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-base-system")).toHaveTextContent("Warhammer 40K 10th Edition");
    });

    it("shows 'Untitled' when name is empty", () => {
      const result = {
        name: "",
        version: "1.0.0",
        author: "",
        schema: {
          version: "1.0.0",
          baseSystem: "blank",
          cardTypes: [{ key: "t", label: "T", baseType: "rule", schema: { fields: [] } }],
        },
      };
      const wizard = createMockWizard({ result });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-name")).toHaveTextContent("Untitled");
    });

    it("shows create mode footer note", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-footer-note")).toHaveTextContent(/Everything looks good/);
    });
  });

  describe("add-card-type mode", () => {
    const addCardTypeResult = {
      key: "battle-rules",
      label: "Battle Rules",
      baseType: "rule",
      schema: {
        fields: [
          { key: "name", label: "Name", type: "string", required: true },
          { key: "desc", label: "Description", type: "richtext", required: false },
        ],
      },
    };

    it("does not show datasource metadata section", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "rule",
        result: addCardTypeResult,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.queryByTestId("dsw-review-metadata")).not.toBeInTheDocument();
    });

    it("shows card type section", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "rule",
        result: addCardTypeResult,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-card-type")).toBeInTheDocument();
    });

    it("displays the card type base type", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "rule",
        result: addCardTypeResult,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-base-type")).toHaveTextContent("Rule");
    });

    it("displays the card type key", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "rule",
        result: addCardTypeResult,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-key")).toHaveTextContent("battle-rules");
    });

    it("displays the card type label", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "rule",
        result: addCardTypeResult,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-label")).toHaveTextContent("Battle Rules");
    });

    it("shows add-card-type mode description", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "rule",
        result: addCardTypeResult,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByText(/Review the card type configuration/)).toBeInTheDocument();
    });

    it("shows add-card-type mode footer note", () => {
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "rule",
        result: addCardTypeResult,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-footer-note")).toHaveTextContent(/Everything looks good/);
    });
  });

  describe("schema summary", () => {
    it("shows stat field count for unit type", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-schema-list")).toBeInTheDocument();
      expect(screen.getByText("2 stat fields")).toBeInTheDocument();
    });

    it("shows weapon type count for unit type", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByText("1 weapon type")).toBeInTheDocument();
    });

    it("shows ability category count for unit type", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByText("1 ability category")).toBeInTheDocument();
    });

    it("shows field count for generic types", () => {
      const result = {
        key: "test",
        label: "Test",
        baseType: "stratagem",
        schema: {
          fields: [
            { key: "name", label: "Name", type: "string" },
            { key: "cost", label: "Cost", type: "string" },
            { key: "desc", label: "Description", type: "richtext" },
          ],
        },
      };
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "stratagem",
        result,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByText("3 fields")).toBeInTheDocument();
    });

    it("shows rules collection for rule type", () => {
      const result = {
        key: "test",
        label: "Test",
        baseType: "rule",
        schema: {
          fields: [{ key: "name", label: "Name", type: "string" }],
          rules: {
            label: "Rules",
            allowMultiple: true,
            fields: [
              { key: "title", label: "Title", type: "string" },
              { key: "desc", label: "Description", type: "richtext" },
            ],
          },
        },
      };
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "rule",
        result,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByText("Rules collection (2 fields)")).toBeInTheDocument();
    });

    it("shows keywords collection for enhancement type", () => {
      const result = {
        key: "test",
        label: "Test",
        baseType: "enhancement",
        schema: {
          fields: [{ key: "name", label: "Name", type: "string" }],
          keywords: {
            label: "Keywords",
            allowMultiple: true,
            fields: [{ key: "keyword", label: "Keyword", type: "string" }],
          },
        },
      };
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "enhancement",
        result,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByText("Keywords collection (1 fields)")).toBeInTheDocument();
    });

    it("shows empty schema message when no fields configured", () => {
      const result = {
        key: "test",
        label: "Test",
        baseType: "stratagem",
        schema: { fields: [] },
      };
      const wizard = createMockWizard({
        mode: WIZARD_MODES.ADD_CARD_TYPE,
        baseType: "stratagem",
        result,
      });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-schema-empty")).toBeInTheDocument();
      expect(screen.getByText(/No fields configured yet/)).toBeInTheDocument();
    });
  });

  describe("unit-specific toggles", () => {
    it("shows keywords badge when enabled", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByText("Keywords")).toBeInTheDocument();
    });

    it("shows faction keywords badge when enabled", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.getByText("Faction Keywords")).toBeInTheDocument();
    });

    it("does not show multiple profiles badge when disabled", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.queryByText("Multiple Profiles")).not.toBeInTheDocument();
    });

    it("does not show points badge when disabled", () => {
      const wizard = createMockWizard();
      render(<StepReview wizard={wizard} />);

      expect(screen.queryByText(/Points/)).not.toBeInTheDocument();
    });

    it("shows all enabled toggles", () => {
      const result = {
        name: "Test",
        version: "1.0.0",
        author: "",
        schema: {
          version: "1.0.0",
          baseSystem: "blank",
          cardTypes: [
            {
              key: "test",
              label: "Test",
              baseType: "unit",
              schema: {
                stats: { label: "Stats", allowMultipleProfiles: true, fields: [] },
                weaponTypes: { label: "Weapons", allowMultiple: true, types: [] },
                abilities: { label: "Abilities", categories: [] },
                metadata: { hasKeywords: true, hasFactionKeywords: false, hasPoints: true, pointsFormat: "per-unit" },
              },
            },
          ],
        },
      };
      const wizard = createMockWizard({ result });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByText("Multiple Profiles")).toBeInTheDocument();
      expect(screen.getByText("Keywords")).toBeInTheDocument();
      expect(screen.getByText(/Points \(per unit\)/)).toBeInTheDocument();
    });
  });

  describe("base system labels", () => {
    it("displays Age of Sigmar label", () => {
      const result = {
        name: "AoS DS",
        version: "1.0.0",
        author: "",
        schema: {
          version: "1.0.0",
          baseSystem: "aos",
          cardTypes: [{ key: "t", label: "T", baseType: "rule", schema: { fields: [] } }],
        },
      };
      const wizard = createMockWizard({ result });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-base-system")).toHaveTextContent("Age of Sigmar");
    });

    it("displays Blank Template label", () => {
      const result = {
        name: "Blank DS",
        version: "1.0.0",
        author: "",
        schema: {
          version: "1.0.0",
          baseSystem: "blank",
          cardTypes: [{ key: "t", label: "T", baseType: "rule", schema: { fields: [] } }],
        },
      };
      const wizard = createMockWizard({ result });
      render(<StepReview wizard={wizard} />);

      expect(screen.getByTestId("dsw-review-base-system")).toHaveTextContent("Blank Template");
    });
  });
});
