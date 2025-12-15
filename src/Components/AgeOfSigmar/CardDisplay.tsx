import { Col } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { WarscrollCard } from "./WarscrollCard";
import { SpellCard } from "./SpellCard";
import { CardDisplayProps } from "../../types/types";

export const AgeOfSigmarCardDisplay = ({
  type,
  card,
  cardScaling,
  printPadding,
  side = "front",
  backgrounds = "standard",
}: CardDisplayProps & { side?: "front"; backgrounds?: "standard" }) => {
  const { activeCard, setActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const { dataSource, selectedFaction } = useDataSourceStorage();

  const displayCard = card || activeCard;
  const cardFaction = dataSource.data.find((faction) => faction.id === displayCard?.faction_id);

  // Get Grand Alliance for theming
  const grandAlliance = cardFaction?.grandAlliance?.toLowerCase() || "order";

  // Get colors - use custom colors if enabled, otherwise faction colors
  const headerColour = displayCard?.useCustomColours
    ? displayCard.customHeaderColour || cardFaction?.colours?.header
    : cardFaction?.colours?.header;
  const bannerColour = displayCard?.useCustomColours
    ? displayCard.customBannerColour || cardFaction?.colours?.banner
    : cardFaction?.colours?.banner;

  // Determine font class based on settings
  const fontClass = settings.useFancyFonts === false ? "aos-regular-fonts" : "";

  // Navigation handlers for viewer mode
  const navigate = useNavigate();
  const location = useLocation();
  const factionSlug = cardFaction?.name?.toLowerCase().replaceAll(" ", "-");

  // Detect if we're in viewer mode based on URL path
  const isViewer = location.pathname.startsWith("/viewer") || location.pathname.startsWith("/mobile");
  const isDesktop = location.pathname.startsWith("/viewer");

  // Editor mode: find and select the linked card
  const handleEditorViewWarscroll = (warscrollName) => {
    // Find the warscroll in the faction data
    const faction = cardFaction || selectedFaction;
    let warscroll = faction?.warscrolls?.find((w) => w.name.toLowerCase() === warscrollName.toLowerCase());

    // If not found, search generic warscrolls
    if (!warscroll && settings?.showGenericManifestations && dataSource?.genericData?.warscrolls) {
      warscroll = dataSource.genericData.warscrolls.find((w) => w.name.toLowerCase() === warscrollName.toLowerCase());
      if (warscroll) {
        setActiveCard({
          ...warscroll,
          cardType: "warscroll",
          source: "aos",
          faction_id: "GENERIC",
        });
        return;
      }
    }

    if (warscroll) {
      setActiveCard({
        ...warscroll,
        cardType: "warscroll",
        source: "aos",
        faction_id: faction.id,
      });
    }
  };

  const handleEditorViewSpell = (spellName) => {
    // Find the spell in manifestation lores
    const faction = cardFaction || selectedFaction;
    for (const lore of faction?.manifestationLores || []) {
      const spell = lore.spells?.find((s) => s.name.toLowerCase() === spellName.toLowerCase());
      if (spell) {
        setActiveCard({
          ...spell,
          cardType: "spell",
          loreName: lore.name,
          source: "aos",
          faction_id: faction.id,
        });
        return;
      }
    }
  };

  // Viewer mode: navigate to the card URL
  const handleViewerViewWarscroll = (warscrollName) => {
    const slug = warscrollName.toLowerCase().replaceAll(" ", "-");
    const basePath = isDesktop ? "/viewer" : "/mobile";
    // For generic spells, use the selected faction's slug since generic warscrolls are viewed in faction context
    const navFactionSlug = factionSlug || selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`${basePath}/${navFactionSlug}/${slug}`);
  };

  const handleViewerViewSpell = (spellName) => {
    const slug = spellName.toLowerCase().replaceAll(" ", "-");
    const basePath = isDesktop ? "/viewer" : "/mobile";
    // For generic warscrolls, use the selected faction's slug since generic content is viewed in faction context
    const navFactionSlug = factionSlug || selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`${basePath}/${navFactionSlug}/manifestation-lore/${slug}`);
  };

  // Choose the appropriate handler based on context
  const handleViewWarscroll = isViewer ? handleViewerViewWarscroll : handleEditorViewWarscroll;
  const handleViewSpell = isViewer ? handleViewerViewSpell : handleEditorViewSpell;

  return (
    <>
      {!type && activeCard && (
        <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
          {activeCard?.cardType === "warscroll" && (
            <div
              className={`data-aos ${grandAlliance} ${fontClass}`}
              style={{
                ...(displayCard?.useCustomColours && {
                  "--bg-header": headerColour,
                  "--banner-colour": bannerColour,
                }),
              }}>
              <WarscrollCard
                warscroll={activeCard}
                faction={cardFaction}
                grandAlliance={grandAlliance}
                headerColour={headerColour}
                bannerColour={bannerColour}
                onViewSpell={handleViewSpell}
              />
            </div>
          )}
          {activeCard?.cardType === "spell" && (
            <div
              className={`data-aos ${grandAlliance} ${fontClass}`}
              style={{
                ...(displayCard?.useCustomColours && {
                  "--bg-header": headerColour,
                  "--banner-colour": bannerColour,
                }),
              }}>
              <SpellCard
                spell={activeCard}
                loreName={activeCard.loreName}
                faction={cardFaction}
                grandAlliance={grandAlliance}
                onViewWarscroll={handleViewWarscroll}
              />
            </div>
          )}
        </Col>
      )}
      {!type && card && card.cardType === "warscroll" && (
        <div
          className={`data-aos ${grandAlliance} ${fontClass}`}
          style={{
            ...(displayCard?.useCustomColours && {
              "--bg-header": headerColour,
              "--banner-colour": bannerColour,
            }),
          }}>
          <WarscrollCard
            warscroll={card}
            faction={cardFaction}
            grandAlliance={grandAlliance}
            headerColour={headerColour}
            bannerColour={bannerColour}
          />
        </div>
      )}
      {type === "print" && card && card?.cardType === "warscroll" && (
        <div
          className={`data-aos ${grandAlliance} ${fontClass}`}
          style={{
            zoom: cardScaling / 100,
            "--card-scaling-factor": 1,
            ...(displayCard?.useCustomColours && {
              "--bg-header": headerColour,
              "--banner-colour": bannerColour,
            }),
          }}>
          <WarscrollCard
            warscroll={card}
            faction={cardFaction}
            grandAlliance={grandAlliance}
            headerColour={headerColour}
            bannerColour={bannerColour}
            isPrint={true}
          />
        </div>
      )}
      {type === "viewer" && (
        <div
          className={`data-aos ${grandAlliance} aos-mobile-wrapper ${fontClass}`}
          style={{
            transformOrigin: "0% 0%",
            ...(cardScaling && { transform: `scale(${cardScaling / 100})` }),
            ...(displayCard?.useCustomColours && {
              "--bg-header": headerColour,
              "--banner-colour": bannerColour,
            }),
          }}>
          {activeCard?.cardType === "warscroll" && (
            <WarscrollCard
              warscroll={activeCard}
              faction={cardFaction}
              grandAlliance={grandAlliance}
              headerColour={headerColour}
              bannerColour={bannerColour}
              isMobile={true}
              onViewSpell={handleViewSpell}
            />
          )}
          {activeCard?.cardType === "spell" && (
            <SpellCard
              spell={activeCard}
              loreName={activeCard.loreName}
              faction={cardFaction}
              grandAlliance={grandAlliance}
              isMobile={true}
              onViewWarscroll={handleViewWarscroll}
            />
          )}
          {card?.cardType === "warscroll" && (
            <WarscrollCard
              warscroll={card}
              faction={cardFaction}
              grandAlliance={grandAlliance}
              headerColour={headerColour}
              bannerColour={bannerColour}
              isMobile={true}
              onViewSpell={handleViewSpell}
            />
          )}
          {card?.cardType === "spell" && (
            <SpellCard
              spell={card}
              loreName={card.loreName}
              faction={cardFaction}
              grandAlliance={grandAlliance}
              isMobile={true}
              onViewWarscroll={handleViewWarscroll}
            />
          )}
        </div>
      )}
    </>
  );
};
