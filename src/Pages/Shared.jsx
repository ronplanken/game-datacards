import { GitFork, AlertCircle } from "lucide-react";
import { Image } from "antd";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useSwipeable } from "react-swipeable";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "../App.css";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useCategorySharing } from "../Hooks/useCategorySharing";
import { useAutoFitScale } from "../Hooks/useAutoFitScale";
import logo from "../Images/logo.png";
import { SharedCardDisplay } from "../Components/Shared/SharedCardDisplay";
import { SharedCardList } from "../Components/Shared/SharedCardList";
import { SharedMobileNav } from "../Components/Shared/SharedMobileNav";
import { SharedMobileCardList } from "../Components/Shared/SharedMobileCardList";
import { BottomSheet } from "../Components/Viewer/Mobile/BottomSheet";
import "../Components/Shared/Shared.css";

export const Shared = () => {
  const { Id } = useParams();
  const navigate = useNavigate();

  const { getSharedCategory } = useCategorySharing();

  const [sharedStorage, setSharedStorage] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for card selection
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [showCardList, setShowCardList] = useState(false);

  const { importCategory } = useCardStorage();

  // Ref for auto-fit scaling
  const cardContainerRef = useRef(null);

  // Use matchMedia for reliable mobile detection (same as Viewer.jsx)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 576px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 576px)");
    const handleChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Derived state
  const cards = sharedStorage?.category?.cards || [];
  const currentCard = cards[selectedCardIndex];
  const totalCards = cards.length;
  const canGoPrev = selectedCardIndex > 0;
  const canGoNext = selectedCardIndex < totalCards - 1;

  // Determine card type for auto-fit scaling
  const getCardType = () => {
    if (!currentCard) return "unit";
    if (currentCard.source === "aos") {
      return currentCard.cardType === "spell" ? "spell" : "warscroll";
    }
    if (currentCard.cardType === "stratagem") return "stratagem";
    if (currentCard.cardType === "enhancement") return "enhancement";
    if (currentCard.cardType === "rule") return "rule";
    if (currentCard.variant === "full") return "unitFull";
    return "unit";
  };

  // Auto-fit scaling for desktop
  const { autoScale } = useAutoFitScale(cardContainerRef, getCardType(), !isMobile);

  // Update document title
  useEffect(() => {
    document.title = `Shared ${sharedStorage?.category?.name || ""} - Game Datacards`;
  }, [sharedStorage]);

  // Fetch shared category
  useEffect(() => {
    if (Id) {
      setIsLoading(true);
      setError(null);
      getSharedCategory(Id)
        .then((data) => {
          if (data) {
            setSharedStorage(data);
          } else {
            setError("This shared link could not be found.");
          }
        })
        .catch(() => {
          setError("Failed to load the shared content.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [Id, getSharedCategory]);

  // Handle clone
  const handleClone = () => {
    const cloneCategory = {
      ...sharedStorage.category,
      name: `Imported ${sharedStorage.category.name}`,
      uuid: uuidv4(),
      cards: sharedStorage.category.cards.map((card) => ({
        ...card,
        uuid: uuidv4(),
      })),
    };

    importCategory(cloneCategory);
    navigate("/");
  };

  // Navigation handlers
  const goToPrev = () => {
    if (canGoPrev) {
      setSelectedCardIndex((i) => i - 1);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      setSelectedCardIndex((i) => i + 1);
    }
  };

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNext(),
    onSwipedRight: () => goToPrev(),
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="shared-loading">
        <div className="shared-loading-spinner" />
        <span className="shared-loading-text">Loading shared cards...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="shared-error">
        <AlertCircle className="shared-error-icon" />
        <h2 className="shared-error-title">Unable to Load</h2>
        <p className="shared-error-message">{error}</p>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="shared-mobile-container">
        {/* Mobile Header */}
        <div className="shared-mobile-header">
          <Image preview={false} src={logo} className="shared-mobile-logo" />
          <span className="shared-mobile-title">{sharedStorage?.category?.name || "Shared Cards"}</span>
        </div>

        {/* Card Display with swipe */}
        <div className="shared-mobile-card-area" {...swipeHandlers}>
          <div className="shared-mobile-card-wrapper">
            <SharedCardDisplay card={currentCard} isMobile={true} />
          </div>
        </div>

        {/* Bottom Navigation */}
        <SharedMobileNav
          currentIndex={selectedCardIndex}
          totalCards={totalCards}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={goToPrev}
          onNext={goToNext}
          onShowList={() => setShowCardList(true)}
        />

        {/* Card List Bottom Sheet */}
        <BottomSheet
          isOpen={showCardList}
          onClose={() => setShowCardList(false)}
          title={`${totalCards} Cards`}
          maxHeight="70vh">
          <SharedMobileCardList
            cards={cards}
            selectedIndex={selectedCardIndex}
            onSelectCard={(index) => {
              setSelectedCardIndex(index);
              setShowCardList(false);
            }}
          />
        </BottomSheet>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="shared-page">
      {/* Header */}
      <header className="shared-header">
        <div className="shared-header-left">
          <Image preview={false} src={logo} className="shared-header-logo" />
          <div>
            <h1 className="shared-header-title">Game Datacards</h1>
            <p className="shared-header-category">{sharedStorage?.category?.name}</p>
          </div>
        </div>

        <div className="shared-header-actions">
          <button className="shared-header-btn" onClick={handleClone}>
            <GitFork size={16} />
            <span>Clone</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="shared-content">
        <PanelGroup direction="horizontal" autoSaveId="sharedLayout">
          {/* Left Panel - Card List */}
          <Panel defaultSize={20} minSize={15} order={1}>
            <SharedCardList cards={cards} selectedIndex={selectedCardIndex} onSelectCard={setSelectedCardIndex} />
          </Panel>

          <PanelResizeHandle className="shared-resizer" />

          {/* Right Panel - Card Display */}
          <Panel defaultSize={80} order={2}>
            <div
              ref={cardContainerRef}
              className={`shared-card-area data-${currentCard?.source || "40k-10e"}`}
              style={{ "--card-scaling-factor": autoScale }}>
              <SharedCardDisplay card={currentCard} />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};
