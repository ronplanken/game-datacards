import { Settings, Share2, User, Cloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Row, Space } from "antd";
import { message } from "../Toast/message";
import { useState, useEffect } from "react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useAuth, useSubscription, useSync, useCloudCategories, usePremiumFeatures, getAvatarUrl } from "../../Premium";
import { AddCard } from "../../Icons/AddCard";
import { ListOverview } from "./ListCreator/ListOverview";
import { useMobileList } from "./useMobileList";

// Get initials from user
const getInitials = (user, profile) => {
  const displayName = profile?.display_name || user?.user_metadata?.display_name;
  if (displayName) {
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  if (user?.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return "??";
};

export const MobileNav = ({ setMenuVisible, setSharingVisible, setAddListvisible, setAccountVisible }) => {
  const navigate = useNavigate();
  const { activeCard } = useCardStorage();
  const { lists, selectedList, selectedCloudCategoryId, addDatacard } = useMobileList();
  const { categories: cloudCategories } = useCloudCategories();
  const { user, profile } = useAuth();
  const { subscription } = useSubscription();
  const { globalSyncStatus, syncedCategoryCount } = useSync();
  const { hasAuth } = usePremiumFeatures();

  // Get selected cloud category if one is selected
  const selectedCloudCategory = selectedCloudCategoryId
    ? cloudCategories.find((c) => c.uuid === selectedCloudCategoryId)
    : null;
  const isCloudCategory = !!selectedCloudCategory;

  // Get tier for avatar border styling
  const tier = subscription?.tier || "free";

  // Avatar image
  const [imgError, setImgError] = useState(false);
  const avatarUrl = getAvatarUrl(user);
  const showImage = !!avatarUrl && !imgError;

  // Reset imgError when avatar URL changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  // Sync badge - only show if user has synced items and status is noteworthy
  const showSyncBadge = user && syncedCategoryCount > 0 && globalSyncStatus !== "idle" && globalSyncStatus !== "synced";
  const syncStatusClass = showSyncBadge ? `mobile-account-avatar-btn--${globalSyncStatus}` : "";

  // Check if current card is AoS (has scalar points, not array)
  const isAoS = activeCard?.source === "aos";

  const [showList, setShowList] = useState(false);

  return (
    <div
      style={{
        height: "64px",
        position: "fixed",
        backgroundColor: "#001529",
        bottom: "0px",
        paddingTop: "4px",
        width: "100vw",
        display: "flex",
        alignItems: "center",
      }}>
      <ListOverview isVisible={showList} setIsVisible={setShowList} />
      <Row style={{ width: "100%" }}>
        <Col span={8} style={{ paddingLeft: "8px" }}>
          <Space.Compact block size="large">
            <Button
              type="ghost"
              size="large"
              className="button-bar"
              shape="round"
              onClick={() =>
                setShowList((val) => {
                  return showList ? false : true;
                })
              }>
              <span ref={parent} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {isCloudCategory ? (
                  <>
                    <Cloud size={14} />
                    {selectedCloudCategory.cardCount} cards
                  </>
                ) : (
                  <>
                    {(lists[selectedList]?.cards || []).reduce((acc, val) => {
                      let cost = acc + Number(val.unitSize?.cost || 0);
                      if (val.selectedEnhancement) {
                        cost = cost + Number(val.selectedEnhancement.cost);
                      }
                      return cost;
                    }, 0)}{" "}
                    pts
                  </>
                )}
              </span>
            </Button>
          </Space.Compact>
        </Col>
        <Col span={8}>
          <Space align="center" style={{ width: "100%", justifyContent: "center" }}>
            {activeCard && activeCard.points && (
              <Button
                icon={<AddCard />}
                type="ghost"
                size="large"
                shape="round"
                className="button-bar mobile-icon-button"
                onClick={() => {
                  if (isAoS) {
                    // AoS: Add directly with fixed points (no unit sizes/enhancements)
                    addDatacard(activeCard, { cost: activeCard.points }, null, false);
                    message.success(`${activeCard.name} added to list`);
                  } else {
                    // 40K: Open the ListAdd sheet for unit size selection
                    setAddListvisible((val) => !val);
                  }
                }}></Button>
            )}
          </Space>
        </Col>
        <Col span={8}>
          <Space align="center" style={{ width: "100%", justifyContent: "flex-end" }}>
            {activeCard && (
              <Button
                type="text"
                style={{ color: "white", paddingRight: "8px", paddingBottom: "8px" }}
                size="large"
                className="mobile-icon-button"
                onClick={() => setSharingVisible(true)}
                icon={<Share2 size={14} />}
              />
            )}
            <Button
              type="text"
              style={{ color: "white", paddingRight: "8px", paddingBottom: "8px" }}
              size="large"
              className="mobile-icon-button"
              onClick={() => setMenuVisible(true)}
              icon={<Settings size={14} />}
            />
            {hasAuth &&
              (user ? (
                <button
                  className={`mobile-account-avatar-btn mobile-account-avatar-btn--${tier}${showImage ? " mobile-account-avatar-btn--has-image" : ""} ${syncStatusClass}`}
                  onClick={() => setAccountVisible(true)}
                  type="button"
                  aria-label="Account"
                  style={{ marginRight: "8px" }}>
                  {showImage ? (
                    <img
                      className="mobile-account-avatar-img"
                      src={avatarUrl}
                      alt=""
                      onError={() => setImgError(true)}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="mobile-account-avatar-initials">{getInitials(user, profile)}</span>
                  )}
                </button>
              ) : (
                <button
                  className="mobile-account-avatar-btn mobile-account-avatar-btn--guest"
                  onClick={() => navigate("/mobile/login")}
                  type="button"
                  aria-label="Sign In"
                  style={{ marginRight: "8px" }}>
                  <User size={16} strokeWidth={2.5} />
                </button>
              ))}
          </Space>
        </Col>
      </Row>
    </div>
  );
};
