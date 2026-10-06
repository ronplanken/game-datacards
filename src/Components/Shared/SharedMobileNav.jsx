import { ChevronLeft, ChevronRight, List } from "lucide-react";
import "./Shared.css";

export const SharedMobileNav = ({ currentIndex, totalCards, canGoPrev, canGoNext, onPrev, onNext, onShowList }) => {
  return (
    <div className="shared-mobile-nav">
      {/* Left: Prev button */}
      <button className="shared-nav-btn" disabled={!canGoPrev} onClick={onPrev} aria-label="Previous card">
        <ChevronLeft size={24} />
      </button>

      {/* Center: Card indicator + list button */}
      <div className="shared-nav-center">
        <button className="shared-nav-indicator" onClick={onShowList} aria-label="Show card list">
          <List size={18} />
          <span className="shared-nav-position">
            {currentIndex + 1} / {totalCards}
          </span>
        </button>
      </div>

      {/* Right: Next */}
      <button className="shared-nav-btn" disabled={!canGoNext} onClick={onNext} aria-label="Next card">
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
