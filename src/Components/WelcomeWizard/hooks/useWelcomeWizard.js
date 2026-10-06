import { useState, useCallback, useMemo, useEffect } from "react";
import { WIZARD_STEPS, DEMO_TREE_DATA, DEMO_CARD_DATA } from "../constants";
import { usePremiumFeatures } from "../../../Premium";
import { useFeatureFlags } from "../../../Hooks/useFeatureFlags";

/**
 * Custom hook for managing Welcome Wizard state
 */
export const useWelcomeWizard = (settings, updateSettings) => {
  const { hasSubscription } = usePremiumFeatures();
  const { paidTierEnabled } = useFeatureFlags();

  // Filter out subscription step when not in premium mode or paid tier is disabled
  const visibleSteps = useMemo(() => {
    if (hasSubscription && paidTierEnabled) {
      return WIZARD_STEPS;
    }
    return WIZARD_STEPS.filter((step) => step.id !== "subscription");
  }, [hasSubscription, paidTierEnabled]);
  // Core navigation state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [transitionDirection, setTransitionDirection] = useState("forward");

  // User selections
  const [selectedGameSystem, setSelectedGameSystem] = useState(settings?.selectedDataSource || null);

  // Demo state for interactive elements
  const [demoTreeData, setDemoTreeData] = useState(DEMO_TREE_DATA);
  const [demoCardData, setDemoCardData] = useState(DEMO_CARD_DATA);
  const [activeDataTab, setActiveDataTab] = useState("import");

  // Sync selectedGameSystem with settings
  useEffect(() => {
    if (settings?.selectedDataSource && !selectedGameSystem) {
      setSelectedGameSystem(settings.selectedDataSource);
    }
  }, [settings?.selectedDataSource, selectedGameSystem]);

  // Check if current step allows proceeding
  const canProceed = useMemo(() => {
    const currentStepConfig = visibleSteps[currentStep];

    // Game system step requires selection
    if (currentStepConfig?.id === "game-system") {
      return !!selectedGameSystem;
    }

    return true;
  }, [currentStep, selectedGameSystem, visibleSteps]);

  // Navigate to a specific step
  const goToStep = useCallback(
    (stepIndex, direction = null) => {
      const targetDirection = direction || (stepIndex > currentStep ? "forward" : "backward");
      setTransitionDirection(targetDirection);

      // Mark current step as completed when moving forward
      if (stepIndex > currentStep) {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }

      setCurrentStep(stepIndex);
    },
    [currentStep],
  );

  // Navigate to next step
  const goNext = useCallback(() => {
    if (currentStep < visibleSteps.length - 1 && canProceed) {
      goToStep(currentStep + 1, "forward");
    }
  }, [currentStep, canProceed, goToStep, visibleSteps]);

  // Navigate to previous step
  const goPrevious = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1, "backward");
    }
  }, [currentStep, goToStep]);

  // Select game system
  const selectGameSystem = useCallback(
    (systemId) => {
      setSelectedGameSystem(systemId);
      // Also update settings immediately for preview purposes
      if (updateSettings && settings) {
        updateSettings({ ...settings, selectedDataSource: systemId });
      }
    },
    [settings, updateSettings],
  );

  // Demo tree interactions
  const toggleTreeItem = useCallback((itemId) => {
    setDemoTreeData((prev) => prev.map((item) => (item.id === itemId ? { ...item, expanded: !item.expanded } : item)));
  }, []);

  const reorderTreeItems = useCallback((sourceId, targetId) => {
    setDemoTreeData((prev) => {
      // Simple reorder - find and swap positions in flat list
      const items = [...prev];
      const sourceIndex = items.findIndex((item) => item.id === sourceId);
      const targetIndex = items.findIndex((item) => item.id === targetId);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [removed] = items.splice(sourceIndex, 1);
        items.splice(targetIndex, 0, removed);
      }

      return items;
    });
  }, []);

  // Demo card interactions
  const updateDemoCard = useCallback((field, value) => {
    setDemoCardData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetDemoCard = useCallback(() => {
    setDemoCardData(DEMO_CARD_DATA);
  }, []);

  // Get current step info
  const currentStepConfig = visibleSteps[currentStep];
  const totalSteps = visibleSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return {
    // Navigation state
    currentStep,
    currentStepConfig,
    totalSteps,
    progress,
    isFirstStep,
    isLastStep,
    completedSteps,
    transitionDirection,
    canProceed,
    visibleSteps,

    // Navigation actions
    goToStep,
    goNext,
    goPrevious,

    // Game system selection
    selectedGameSystem,
    selectGameSystem,

    // Demo state
    demoTreeData,
    demoCardData,
    activeDataTab,

    // Demo actions
    toggleTreeItem,
    reorderTreeItems,
    updateDemoCard,
    resetDemoCard,
    setActiveDataTab,
  };
};
