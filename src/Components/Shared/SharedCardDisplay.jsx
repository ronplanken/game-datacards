import { Warhammer40KCardDisplay } from "../Warhammer40k/CardDisplay";
import { Warhammer40K10eCardDisplay } from "../Warhammer40k-10e/CardDisplay";
import { NecromundaCardDisplay } from "../Necromunda/CardDisplay";
import { WarscrollCard } from "../AgeOfSigmar/WarscrollCard";
import { SpellCard } from "../AgeOfSigmar/SpellCard";
import "./Shared.css";

export const SharedCardDisplay = ({ card, isMobile = false }) => {
  if (!card) {
    return (
      <div className="shared-no-card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <span>Select a card to view</span>
      </div>
    );
  }

  const source = card.source || "40k";
  const grandAlliance = card.grandAlliance?.toLowerCase() || "order";
  const headerColour = card.useCustomColours ? card.customHeaderColour : undefined;
  const bannerColour = card.useCustomColours ? card.customBannerColour : undefined;

  const renderCard = () => {
    switch (source) {
      case "40k":
        return <Warhammer40KCardDisplay card={card} type="print" />;

      case "40k-10e": {
        // Force DataCards to show as full (both sides) variant
        const displayCard =
          card.cardType === "DataCard" && card.variant !== "full" ? { ...card, variant: "full" } : card;
        return <Warhammer40K10eCardDisplay card={displayCard} type={isMobile ? "viewer" : "print"} />;
      }

      case "basic":
        return <Warhammer40KCardDisplay card={card} type="print" />;

      case "necromunda":
        return <NecromundaCardDisplay card={card} type="print" />;

      case "aos":
        return (
          <div
            className={`data-aos ${grandAlliance}${isMobile ? " aos-mobile-wrapper" : ""}`}
            style={{
              ...(card.useCustomColours && {
                "--bg-header": headerColour,
                "--banner-colour": bannerColour,
              }),
            }}>
            {card.cardType === "warscroll" && (
              <WarscrollCard
                warscroll={card}
                grandAlliance={grandAlliance}
                headerColour={headerColour}
                bannerColour={bannerColour}
                isMobile={isMobile}
              />
            )}
            {card.cardType === "spell" && (
              <SpellCard spell={card} loreName={card.loreName} grandAlliance={grandAlliance} isMobile={isMobile} />
            )}
          </div>
        );

      default:
        return <Warhammer40KCardDisplay card={card} type="print" />;
    }
  };

  return (
    <div className="shared-card-wrapper">
      <div className={`shared-card-container data-${source}`}>{renderCard()}</div>
    </div>
  );
};
