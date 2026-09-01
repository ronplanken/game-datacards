import { useState, useEffect, useRef, useCallback } from "react";
import {
  Crown,
  Trash2,
  FileText,
  List,
  ChevronDown,
  ChevronLeft,
  Upload,
  ChevronRight,
  Cloud,
  MoreHorizontal,
  Share2,
  Link,
  Check,
  Loader,
  RefreshCw,
} from "lucide-react";
import { message } from "../../Toast/message";
import { useNavigate, useLocation } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { useCloudCategories, ListSyncButton } from "../../../Premium";
import { useAuth } from "../../../Premium";
import { useCategorySharing } from "../../../Hooks/useCategorySharing";
import { useMobileList } from "../useMobileList";
import { capitalizeSentence } from "../../../Helpers/external.helpers";
import { localize } from "../../../Helpers/localization.helpers";
import { computeCategoryPoints, getCardDisplayCost } from "../../../Helpers/listPoints.helpers";
import {
  categorize40kUnits,
  categorizeAoSUnits,
  format40kListText,
  formatAoSListText,
  sortCards,
  SECTIONS_40K,
  SECTIONS_AOS,
} from "../../../Helpers/listCategories.helpers";
import { getAttachedLeaders, getAttachedSquad, requiresAttachment } from "../../../Helpers/listAttachments.helpers";
import {
  describeRepricedCards,
  getBattleSize,
  getEnhancementUsage,
  getForceDispositions,
  getListFactionId,
  getSpentDetachmentPoints,
  isDetachmentSelectionOverBudget,
} from "../../../Helpers/listRoster.helpers";
import { MobileModal } from "../Mobile/MobileModal";
import { ArmyRosterSheet } from "../Mobile/ArmyRosterSheet";
import { ListSelector } from "./ListSelector";
import { ListEditCard } from "./ListEditCard";
import { MobileGwImporter, MobileListForgeImporter } from "../MobileImporter";
import "./ListOverview.css";

// Import action button (prominent, at top of content)
const ImportActionButton = ({ onClick }) => (
  <button className="list-overview-import-action" onClick={onClick} type="button">
    <Upload size={18} />
    <span>Import Army List</span>
    <ChevronRight size={18} />
  </button>
);

// Game system badge for cloud categories
const GameSystemBadge = ({ system }) => {
  const labels = {
    "40k": "40K",
    aos: "AoS",
    necro: "Necro",
    custom: "Custom",
  };
  return (
    <span className={`list-overview-cloud-badge list-overview-cloud-badge--${system}`}>
      {labels[system] || "Custom"}
    </span>
  );
};

// Header with list selector, sync button, and more actions menu
const ListHeader = ({
  listName,
  onListSelectorClick,
  onCopyToClipboard,
  onShareList,
  canShare,
  isCloudCategory,
  isSynced,
  gameSystem,
  syncButton,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  return (
    <div className="list-overview-list-header">
      <button className="list-overview-name-selector" onClick={onListSelectorClick} type="button">
        {(isCloudCategory || isSynced) && <Cloud size={16} className="list-overview-cloud-icon" />}
        <span className="list-overview-name-text">{listName}</span>
        {isCloudCategory && <GameSystemBadge system={gameSystem} />}
        <ChevronDown size={16} />
      </button>
      <div className="list-overview-header-actions">
        {syncButton}
        <div className="list-overview-more-wrapper" ref={menuRef}>
          <button className="list-overview-more-button" onClick={() => setShowMoreMenu(!showMoreMenu)} type="button">
            <MoreHorizontal size={18} />
          </button>
          {showMoreMenu && (
            <>
              <div className="list-overview-more-backdrop" onClick={() => setShowMoreMenu(false)} />
              <div className="list-overview-more-menu">
                <button
                  className="list-overview-more-item"
                  onClick={() => {
                    onCopyToClipboard();
                    setShowMoreMenu(false);
                  }}
                  type="button">
                  <FileText size={16} />
                  <span>Copy List</span>
                </button>
                {canShare && (
                  <button
                    className="list-overview-more-item"
                    onClick={() => {
                      onShareList();
                      setShowMoreMenu(false);
                    }}
                    type="button">
                    <Share2 size={16} />
                    <span>Share List</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Single list item component (local lists - with delete)
const ListItem = ({ item, onNavigate, onDelete, onEdit, isAoS, allCards = [] }) => {
  const isUnconfigured = !item.unitSize;
  // 40K rows include the enhancement and this copy's share of the datasheet
  // surcharge, so the rows add up to the list total.
  const totalCost = isAoS ? Number(item.unitSize?.cost) || 0 : getCardDisplayCost(item, allCards);

  // Leader/support attachment indicators (11e): the squad this unit is attached
  // to, and any leaders attached to this squad. Support units must be attached,
  // so flag them when they are not. Uses the shared (tested) helpers so stale
  // `attachedTo` handling stays in one place.
  const attachedSquadName = getAttachedSquad(item, allCards)?.name || null;
  const hostedLeaders = getAttachedLeaders(item, allCards).map((c) => c.name);
  const needsAttachment = requiresAttachment(item) && !attachedSquadName;

  return (
    <div className="list-overview-item">
      <div className="list-overview-item-main" onClick={() => onNavigate(item)}>
        <div className="list-overview-item-name">
          {item.isWarlord && <Crown size={14} fill="currentColor" />}
          <span>{item.name}</span>
        </div>
        {!isAoS && item.selectedEnhancement && (
          <div className="list-overview-item-enhancement">{capitalizeSentence(item.selectedEnhancement.name)}</div>
        )}
        {!isAoS && item.selectedWargear?.length > 0 && (
          <div className="list-overview-item-enhancement">
            {item.selectedWargear
              .map((entry) => `${entry?.quantity > 1 ? `${entry.quantity}x ` : ""}${localize(entry?.name)}`)
              .join(", ")}
          </div>
        )}
        {attachedSquadName && <div className="list-overview-item-attachment">Attached to {attachedSquadName}</div>}
        {hostedLeaders.length > 0 && (
          <div className="list-overview-item-attachment">Led by {hostedLeaders.join(", ")}</div>
        )}
        {needsAttachment && (
          <div className="list-overview-item-attachment list-overview-item-attachment--warning">
            Must be attached to a unit
          </div>
        )}
      </div>
      {isUnconfigured ? (
        <button className="list-overview-item-configure" onClick={() => onEdit(item)} type="button">
          Set
        </button>
      ) : (
        <div className="list-overview-item-points">
          {!isAoS && item.unitSize?.models > 1 ? `${item.unitSize.models}x ` : ""}
          {totalCost} pts
        </div>
      )}
      <button className="list-overview-item-delete" onClick={() => onDelete(item.uuid)}>
        <Trash2 size={18} />
      </button>
    </div>
  );
};

// Cloud category item (read-only - no delete button)
const CloudListItem = ({ card, onNavigate }) => (
  <div className="list-overview-item list-overview-item--cloud">
    <div className="list-overview-item-main" onClick={() => onNavigate(card)}>
      <div className="list-overview-item-name">
        <span>{card.name}</span>
      </div>
    </div>
    <ChevronRight size={18} className="list-overview-item-arrow" />
  </div>
);

// Section renderer component
const ListSection = ({ sectionKey, label, cards, onNavigate, onDelete, onEdit, isAoS, allCards }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <>
      <div className="list-overview-section">{label}</div>
      {sortCards(cards).map((item) => (
        <ListItem
          key={item.uuid}
          item={item}
          onNavigate={onNavigate}
          onDelete={onDelete}
          onEdit={onEdit}
          isAoS={isAoS}
          allCards={allCards}
        />
      ))}
    </>
  );
};

// Share sheet for category sharing (inline in ListOverview)
const ListShareSheet = ({ isVisible, onClose, category }) => {
  const { shareAnonymous, shareOwned, updateShare, getExistingShare, isSharing } = useCategorySharing();
  const { isAuthenticated } = useAuth();

  const [shareResult, setShareResult] = useState(null);
  const [shareError, setShareError] = useState(null);
  const [existingShare, setExistingShare] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [copied, setCopied] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);

  useEffect(() => {
    if (isVisible && isAuthenticated && category?.uuid) {
      setCheckingExisting(true);
      getExistingShare(category.uuid)
        .then((share) => setExistingShare(share))
        .finally(() => setCheckingExisting(false));
    }
  }, [isVisible, isAuthenticated, category?.uuid, getExistingShare]);

  const handleClose = () => {
    onClose();
    setShareResult(null);
    setShareError(null);
    setExistingShare(null);
    setIsPublic(true);
    setCopied(false);
  };

  const handleShare = async () => {
    if (!category) return;
    setShareError(null);
    let result;
    if (isAuthenticated) {
      result = await shareOwned(category, isPublic);
    } else {
      result = await shareAnonymous(category);
    }
    if (result.success) {
      setShareResult(result.shareId);
    } else {
      setShareError(result.error || "Could not share this list");
    }
  };

  const handleUpdate = async () => {
    if (!category || !existingShare?.share_id) return;
    setShareError(null);
    const result = await updateShare(existingShare.share_id, category);
    if (result.success) {
      setShareResult(existingShare.share_id);
    } else {
      setShareError(result.error || "Could not update this share");
    }
  };

  const handleCopy = () => {
    const id = shareResult || existingShare?.share_id;
    if (!id) return;
    navigator.clipboard.writeText(`${import.meta.env.VITE_URL}/shared/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentShareId = shareResult || existingShare?.share_id;
  const shareUrl = currentShareId ? `${import.meta.env.VITE_URL}/shared/${currentShareId}` : null;

  return (
    <MobileModal isOpen={isVisible} onClose={handleClose} title="Share List" zIndex={1002}>
      <div className="list-share-sheet">
        <div className="list-share-info">
          <span className="list-share-name">{category?.name}</span>
          <span className="list-share-meta">
            {category?.cards?.length || 0} {category?.cards?.length === 1 ? "card" : "cards"}
          </span>
        </div>

        {/* Visibility toggle (authenticated, before sharing) */}
        {isAuthenticated && !shareResult && !existingShare && (
          <div className="list-share-visibility">
            <span className="list-share-visibility-label">Public link</span>
            <button
              className={`list-share-visibility-toggle ${isPublic ? "active" : ""}`}
              onClick={() => setIsPublic(!isPublic)}
              role="switch"
              aria-checked={isPublic}>
              <span className="list-share-visibility-thumb" />
            </button>
          </div>
        )}

        {/* Share failure (e.g. the sharing hook's 100 card limit) */}
        {shareError && <div className="list-share-error">{shareError}</div>}

        {/* Share result */}
        {shareUrl && (
          <div className="list-share-result">
            <span className="list-share-result-url">{shareUrl}</span>
            <button className="list-share-result-copy" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Link size={16} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        )}

        {/* Actions */}
        {checkingExisting ? (
          <div className="list-share-loading">
            <Loader size={16} className="list-share-spinner" />
            <span>Checking...</span>
          </div>
        ) : existingShare && !shareResult ? (
          <div className="list-share-actions">
            <button className="list-share-btn" onClick={handleUpdate} disabled={isSharing}>
              {isSharing ? <Loader size={16} className="list-share-spinner" /> : <RefreshCw size={16} />}
              <span>{isSharing ? "Updating..." : "Update Existing Share"}</span>
            </button>
            <button className="list-share-btn list-share-btn--secondary" onClick={handleShare} disabled={isSharing}>
              <span>Create New Share</span>
            </button>
          </div>
        ) : !shareResult ? (
          <button className="list-share-btn" onClick={handleShare} disabled={isSharing}>
            {isSharing ? <Loader size={16} className="list-share-spinner" /> : <Share2 size={16} />}
            <span>{isSharing ? "Generating..." : isAuthenticated ? "Share" : "Generate Link"}</span>
          </button>
        ) : (
          <button className="list-share-btn" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Link size={16} />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </button>
        )}
      </div>
    </MobileModal>
  );
};

export const ListOverview = ({ isVisible, setIsVisible }) => {
  const { lists, selectedList, removeDatacard, selectedCloudCategoryId, setListDetachments, setListBattleSize } =
    useMobileList();
  const { dataSource, selectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const { categories: cloudCategories } = useCloudCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const [isListSelectorVisible, setIsListSelectorVisible] = useState(false);
  const [showImportPicker, setShowImportPicker] = useState(false);
  const [activeImporter, setActiveImporter] = useState(null); // null | "gw" | "listforge"
  const [editingCard, setEditingCard] = useState(null);
  const [isShareSheetVisible, setIsShareSheetVisible] = useState(false);
  const [isRosterSheetVisible, setIsRosterSheetVisible] = useState(false);
  const [urlPayload, setUrlPayload] = useState(null);

  // Consume ListForge URL payload from router state
  useEffect(() => {
    const payload = location.state?.listForgePayload;
    if (payload) {
      navigate(location.pathname, { replace: true, state: {} });
      setUrlPayload(payload);
      setActiveImporter("listforge");
      setIsVisible(true);
    }
  }, [location.state?.listForgePayload]);

  // Clear URL payload when importer closes
  const handleImporterClose = useCallback(() => {
    setActiveImporter(null);
    setUrlPayload(null);
  }, []);

  // Derive selected cloud category from the realtime-updated list
  const selectedCloudCategory = selectedCloudCategoryId
    ? cloudCategories.find((c) => c.uuid === selectedCloudCategoryId)
    : null;

  // Check if viewing a cloud category
  const isCloudCategory = !!selectedCloudCategory;

  // Detect game system
  const isAoS = settings.selectedDataSource === "aos";
  const is40k = settings.selectedDataSource === "40k-10e";
  // 11e armies buy several detachments with Detachment Points, so they get the
  // army roster sheet (battle size + detachments + force dispositions).
  const is11e = settings.selectedDataSource === "40k-11e";
  // Both 40k editions export from the same app, and the parser reads both, so
  // both can be imported into.
  const canImport = is40k || is11e;

  // Get current list data (local or cloud)
  const currentList = lists[selectedList];
  const currentListName = isCloudCategory ? selectedCloudCategory.name : currentList?.name || "List";
  const currentCards = isCloudCategory ? selectedCloudCategory.cards : currentList?.cards || [];

  // Army-wide roster settings (11e): battle size, detachments and their DP.
  const armyDetachments = currentList?.detachments || [];
  const armyBattleSize = getBattleSize(currentList?.battleSize);
  const spentDetachmentPoints = getSpentDetachmentPoints(armyDetachments);
  // Lowering the battle size can leave detachments the new budget cannot pay
  // for; nothing is dropped automatically, so flag it instead.
  const detachmentsOverBudget = isDetachmentSelectionOverBudget(armyDetachments, currentList?.battleSize);
  const forceDispositions = getForceDispositions(armyDetachments, settings.language);
  const enhancementUsage = getEnhancementUsage(currentCards, currentList?.battleSize);
  // The list's own faction, so detachments can be picked before the first unit is
  // added. Lists made before the faction was recorded fall back to their cards,
  // and a list with neither to the faction being browsed.
  const listFactionId = getListFactionId(currentList) || selectedFaction?.id;
  const listFaction = dataSource.data.find((faction) => faction.id === listFactionId);
  const availableDetachments = listFaction?.detachments || [];

  // Detachments can change what units cost, so the list is repriced in the same
  // write and the affected units are named in a toast.
  const handleChangeDetachments = (detachments) => {
    const summary = describeRepricedCards(setListDetachments(detachments, { faction: listFaction }));
    if (summary) message.info(summary);
  };

  // Get appropriate sections and categorization (only for local lists)
  const sections = isAoS ? SECTIONS_AOS : SECTIONS_40K;
  const sortedCards =
    !isCloudCategory && currentCards.length > 0
      ? isAoS
        ? categorizeAoSUnits(currentCards)
        : categorize40kUnits(currentCards)
      : {};

  const handleClose = () => {
    setShowImportPicker(false);
    setIsVisible(false);
  };

  // Navigate to a card (handles both local list items and cloud category cards)
  const handleNavigate = (item) => {
    // Both local list items and cloud category cards are flat — item IS the card
    const card = item;
    const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);

    if (!cardFaction) {
      // For cloud cards without faction match, just navigate with the card data
      if (isCloudCategory && card?.name) {
        // Use the cloud card's source to determine the base URL pattern
        const factionName = card.faction_id || "unknown";
        navigate(
          `/mobile/${factionName.toLowerCase().replaceAll(" ", "-")}/${card.name.replaceAll(" ", "-").toLowerCase()}`,
          {
            state: { cloudCard: card },
          },
        );
        handleClose();
      }
      return;
    }

    // Pass the stored card data through router state
    navigate(
      `/mobile/${cardFaction.name.toLowerCase().replaceAll(" ", "-")}/${card.name.replaceAll(" ", "-").toLowerCase()}`,
      {
        state: { listCard: card },
      },
    );
    handleClose();
  };

  const handleCopyToClipboard = () => {
    if (isCloudCategory) {
      // For cloud categories, just list the card names
      const cardNames = currentCards.map((card) => card.name).join("\n");
      navigator.clipboard.writeText(cardNames);
      message.success("Card names copied to clipboard");
    } else {
      const listText = isAoS ? formatAoSListText(sortedCards, sections) : format40kListText(sortedCards, sections);
      navigator.clipboard.writeText(listText);
      message.success("List copied to clipboard");
    }
  };

  // Calculate total points (only for local lists). Includes 11e cards (defaulting
  // to their cheapest tier) and the per-datasheet roster surcharge; see
  // listPoints.helpers.
  const { surcharge: pointsSurcharge, total: totalPoints } = isCloudCategory
    ? { surcharge: 0, total: 0 }
    : computeCategoryPoints(currentCards);

  // The category the share sheet operates on. A cloud category shares the very
  // object the overview renders, so the link always contains what is on screen;
  // it carries the same uuid as its local mirror, so an existing share is still
  // found and can be updated. Local lists keep sharing the selected list.
  const shareCategory = isCloudCategory ? selectedCloudCategory : currentList;

  const isEmpty = currentCards.length === 0;

  return (
    <>
      <MobileModal
        isOpen={isVisible}
        onClose={handleClose}
        title={showImportPicker ? "Import Army List" : isCloudCategory ? "Cloud Category" : "Lists"}>
        {showImportPicker ? (
          <div className="import-picker-step">
            <button className="import-picker-back" onClick={() => setShowImportPicker(false)} type="button">
              <ChevronLeft size={16} /> Back
            </button>
            <div className="import-picker-list">
              <button
                className="import-picker-option"
                onClick={() => {
                  setShowImportPicker(false);
                  setActiveImporter("gw");
                  setIsVisible(false);
                }}
                type="button">
                <Upload size={18} />
                <div className="import-picker-option-text">
                  <span className="import-picker-option-title">GW App</span>
                  <span className="import-picker-option-desc">Paste text from the official Warhammer 40,000 app</span>
                </div>
                <ChevronRight size={16} />
              </button>
              {/* List Forge builds its cards itself, as 10th edition ones, so it is
                  not offered while an 11th edition list is open. */}
              {is40k && (
                <button
                  className="import-picker-option"
                  onClick={() => {
                    setShowImportPicker(false);
                    setActiveImporter("listforge");
                    setIsVisible(false);
                  }}
                  type="button">
                  <FileText size={18} />
                  <div className="import-picker-option-text">
                    <span className="import-picker-option-title">List Forge</span>
                    <span className="import-picker-option-desc">Upload or paste a JSON export</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Only show import for 40k local lists */}
            {canImport && !isCloudCategory && (
              <div className="list-overview-import-section">
                <ImportActionButton onClick={() => setShowImportPicker(true)} />
              </div>
            )}
            <div className="list-overview-header-sticky">
              <ListHeader
                listName={currentListName}
                onListSelectorClick={() => setIsListSelectorVisible(true)}
                onCopyToClipboard={handleCopyToClipboard}
                onShareList={() => setIsShareSheetVisible(true)}
                canShare={!!shareCategory}
                isCloudCategory={isCloudCategory}
                isSynced={!isCloudCategory && !!currentList?.syncEnabled}
                gameSystem={isCloudCategory ? selectedCloudCategory.gameSystem : null}
                syncButton={!isCloudCategory && currentList ? <ListSyncButton category={currentList} /> : null}
              />
            </div>

            {/* Army roster (11e): shown before any unit is added, so the army's
                detachments are chosen up front. */}
            {is11e && !isCloudCategory && (
              <button className="list-overview-roster" onClick={() => setIsRosterSheetVisible(true)} type="button">
                <span className="list-overview-roster-main">
                  <span className="list-overview-roster-label">
                    {armyBattleSize.label} ·{" "}
                    <span className={detachmentsOverBudget ? "list-overview-roster-over" : ""}>
                      {spentDetachmentPoints}/{armyBattleSize.dp} DP
                    </span>{" "}
                    ·{" "}
                    <span className={enhancementUsage.exceeded ? "list-overview-roster-over" : ""}>
                      {enhancementUsage.used}/{enhancementUsage.limit} enhancements
                    </span>
                  </span>
                  <span className="list-overview-roster-detachments">
                    {armyDetachments.length === 0
                      ? "Select detachments"
                      : forceDispositions
                          .map((entry) =>
                            entry.disposition ? `${entry.detachment} (${entry.disposition})` : entry.detachment,
                          )
                          .join(", ")}
                  </span>
                </span>
                <ChevronRight size={18} />
              </button>
            )}

            {isEmpty ? (
              <div className="list-overview-empty">
                {isCloudCategory ? <Cloud size={48} /> : <List size={48} />}
                <span className="list-overview-empty-text">
                  {isCloudCategory ? "This category has no cards" : "Your list is empty"}
                </span>
              </div>
            ) : isCloudCategory ? (
              /* Cloud category cards - simple flat list, read-only */
              <div className="list-overview-items list-overview-items--cloud">
                {currentCards.map((card, index) => (
                  <CloudListItem key={card.uuid || card.id || index} card={card} onNavigate={handleNavigate} />
                ))}
                <div className="list-overview-cloud-footer">
                  <span className="list-overview-cloud-count">{currentCards.length} cards</span>
                </div>
              </div>
            ) : (
              /* Local list cards - categorized with delete buttons */
              <div className="list-overview-items">
                {sections.map((section) => (
                  <ListSection
                    key={section.key}
                    sectionKey={section.key}
                    label={section.label}
                    cards={sortedCards[section.key]}
                    onNavigate={handleNavigate}
                    onDelete={removeDatacard}
                    onEdit={setEditingCard}
                    isAoS={isAoS}
                    allCards={currentCards}
                  />
                ))}

                {pointsSurcharge > 0 && (
                  <div className="list-overview-surcharge">
                    <span className="list-overview-total-label">Additional selections</span>
                    <span className="list-overview-surcharge-value">+{pointsSurcharge} pts</span>
                  </div>
                )}
                <div className="list-overview-total">
                  <span className="list-overview-total-label">Total</span>
                  <span
                    className={`list-overview-total-value ${
                      is11e && totalPoints > armyBattleSize.points ? "list-overview-total-value--over" : ""
                    }`}>
                    {totalPoints}
                    {is11e ? ` / ${armyBattleSize.points}` : ""} pts
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </MobileModal>

      <ListSelector isVisible={isListSelectorVisible} setIsVisible={setIsListSelectorVisible} />

      <ArmyRosterSheet
        isOpen={isRosterSheetVisible}
        onClose={() => setIsRosterSheetVisible(false)}
        detachments={availableDetachments}
        selectedDetachments={armyDetachments}
        battleSize={currentList?.battleSize}
        onChangeBattleSize={setListBattleSize}
        onChangeDetachments={handleChangeDetachments}
        language={settings.language}
      />

      <MobileGwImporter isOpen={activeImporter === "gw"} onClose={() => setActiveImporter(null)} />

      <MobileListForgeImporter
        isOpen={activeImporter === "listforge"}
        onClose={handleImporterClose}
        initialData={urlPayload}
      />

      <ListEditCard
        isVisible={!!editingCard}
        setIsVisible={(v) => {
          if (!v) setEditingCard(null);
        }}
        card={editingCard}
      />

      {shareCategory && (
        <ListShareSheet
          isVisible={isShareSheetVisible}
          onClose={() => setIsShareSheetVisible(false)}
          category={shareCategory}
        />
      )}
    </>
  );
};
