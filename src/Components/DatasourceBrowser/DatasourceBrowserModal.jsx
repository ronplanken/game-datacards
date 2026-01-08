import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Globe, X, Search, Download, Users, Star, ChevronRight, Loader2 } from "lucide-react";
import { useDatasourceSharing, GAME_SYSTEMS, SORT_OPTIONS } from "../../Hooks/useDatasourceSharing";
import { DatasourceCard } from "./DatasourceCard";
import { DatasourceDetailModal } from "./DatasourceDetailModal";
import "./DatasourceBrowserModal.css";

export const DatasourceBrowserModal = ({ isOpen, onClose }) => {
  const {
    publicDatasources,
    isLoadingPublic,
    browseFilters,
    pagination,
    browsePublicDatasources,
    getFeaturedDatasources,
    setBrowseFilters,
  } = useDatasourceSharing();

  const [searchInput, setSearchInput] = useState("");
  const [featuredDatasources, setFeaturedDatasources] = useState([]);
  const [selectedDatasource, setSelectedDatasource] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen && !initialLoadDone) {
      // Load featured
      getFeaturedDatasources().then(setFeaturedDatasources);
      // Load browse list
      browsePublicDatasources({}, true);
      setInitialLoadDone(true);
    }

    // Reset when modal closes
    if (!isOpen) {
      setInitialLoadDone(false);
      setSearchInput("");
    }
  }, [isOpen, initialLoadDone, getFeaturedDatasources, browsePublicDatasources]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen && !showDetailModal) {
        onClose();
      }
    },
    [isOpen, onClose, showDetailModal]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSearch = () => {
    browsePublicDatasources({ search: searchInput }, true);
  };

  const handleFilterChange = (key, value) => {
    setBrowseFilters((prev) => ({ ...prev, [key]: value }));
    browsePublicDatasources({ [key]: value }, true);
  };

  const handleLoadMore = () => {
    browsePublicDatasources();
  };

  const handleDatasourceClick = (datasource) => {
    setSelectedDatasource(datasource);
    setShowDetailModal(true);
  };

  const handleDetailClose = () => {
    setShowDetailModal(false);
    setSelectedDatasource(null);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="db-modal-overlay" onClick={handleOverlayClick}>
      <div className="db-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="db-modal-header">
          <span className="db-modal-title">
            <Globe size={18} />
            Browse Community Datasources
          </span>
          <button className="db-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="db-filters-bar">
          <div className="db-search-wrapper">
            <Search size={14} className="db-search-icon" />
            <input
              type="text"
              className="db-search-input"
              placeholder="Search datasources..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="db-search-btn" onClick={handleSearch}>
              Search
            </button>
          </div>

          <div className="db-filter-group">
            <select
              className="db-filter-select"
              value={browseFilters.gameSystem || ""}
              onChange={(e) => handleFilterChange("gameSystem", e.target.value || null)}>
              <option value="">All Game Systems</option>
              {GAME_SYSTEMS.map((gs) => (
                <option key={gs.value} value={gs.value}>
                  {gs.label}
                </option>
              ))}
            </select>

            <select
              className="db-filter-select"
              value={browseFilters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="db-modal-content">
          {/* Featured Section */}
          {featuredDatasources.length > 0 && !browseFilters.search && (
            <section className="db-featured-section">
              <div className="db-section-header">
                <Star size={16} className="db-section-icon" />
                <span>Featured</span>
              </div>
              <div className="db-featured-grid">
                {featuredDatasources.map((ds) => (
                  <DatasourceCard key={ds.id} datasource={ds} onClick={() => handleDatasourceClick(ds)} compact />
                ))}
              </div>
            </section>
          )}

          {/* All Datasources */}
          <section className="db-browse-section">
            <div className="db-section-header">
              <Globe size={16} className="db-section-icon" />
              <span>
                {browseFilters.search
                  ? `Search Results for "${browseFilters.search}"`
                  : browseFilters.gameSystem
                  ? GAME_SYSTEMS.find((g) => g.value === browseFilters.gameSystem)?.label
                  : "All Datasources"}
              </span>
            </div>

            {isLoadingPublic && publicDatasources.length === 0 ? (
              <div className="db-loading-state">
                <Loader2 size={24} className="db-loading-spinner" />
                <span>Loading datasources...</span>
              </div>
            ) : publicDatasources.length === 0 ? (
              <div className="db-empty-state">
                <Globe size={32} className="db-empty-icon" />
                <p>No datasources found</p>
                <span>Try adjusting your search or filters</span>
              </div>
            ) : (
              <>
                <div className="db-datasource-grid">
                  {publicDatasources.map((ds) => (
                    <DatasourceCard key={ds.id} datasource={ds} onClick={() => handleDatasourceClick(ds)} />
                  ))}
                </div>

                {pagination.hasMore && (
                  <div className="db-load-more">
                    <button className="db-load-more-btn" onClick={handleLoadMore} disabled={isLoadingPublic}>
                      {isLoadingPublic ? (
                        <>
                          <Loader2 size={14} className="db-loading-spinner" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <ChevronRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDatasource && (
        <DatasourceDetailModal datasource={selectedDatasource} isOpen={showDetailModal} onClose={handleDetailClose} />
      )}
    </div>,
    document.body
  );
};
