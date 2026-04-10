import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { helpCategories, helpIconMap } from "../helpSections";

export const HelpSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(() => new Set());

  // Auto-expand category containing current page
  useEffect(() => {
    const cat = helpCategories.find((c) => c.sections.some((s) => location.pathname === `/help/${c.key}/${s.key}`));
    if (cat) {
      setExpandedCategories((prev) => new Set(prev).add(cat.key));
    }
  }, [location.pathname]);

  // Close mobile sidebar on route change (skip initial mount)
  const prevPathnameRef = useRef(location.pathname);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      onCloseRef.current?.();
    }
  }, [location.pathname]);

  const toggleCategory = (key) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return helpCategories;
    const q = searchQuery.toLowerCase();
    return helpCategories
      .map((cat) => ({
        ...cat,
        sections: cat.sections.filter((s) => s.label.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.sections.length > 0);
  }, [searchQuery]);

  return (
    <>
      {isOpen && <div className="help-sidebar-overlay" onClick={onClose} />}
      <aside className={`help-sidebar ${isOpen ? "help-sidebar-open" : ""}`}>
        <div className="help-sidebar-header">
          <button className="help-back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} />
            Back to App
          </button>
        </div>
        <div className="help-search-wrapper">
          <Search size={14} className="help-search-icon" />
          <input
            type="text"
            className="help-search"
            placeholder="Search docs..."
            aria-label="Search documentation"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <nav className="help-nav">
          {filteredCategories.map((cat) => {
            const Icon = helpIconMap[cat.icon];
            const isExpanded = expandedCategories.has(cat.key);
            const hasActivePage = cat.sections.some((s) => location.pathname === `/help/${cat.key}/${s.key}`);

            return (
              <div key={cat.key} className="help-category">
                <button
                  className={`help-category-header ${hasActivePage ? "help-category-header-active" : ""}`}
                  onClick={() => toggleCategory(cat.key)}
                  aria-expanded={isExpanded}>
                  <span className="help-category-label">
                    <ChevronRight
                      size={12}
                      className={`help-category-chevron ${isExpanded ? "help-category-chevron-open" : ""}`}
                    />
                    {Icon && <Icon size={15} className={hasActivePage ? "help-category-icon-active" : ""} />}
                    {cat.label}
                  </span>
                </button>
                {isExpanded && (
                  <div className="help-category-items">
                    {cat.sections.map((s) => {
                      const href = `/help/${cat.key}/${s.key}`;
                      const isActive = location.pathname === href;
                      return (
                        <Link
                          key={s.key}
                          to={href}
                          className={`help-nav-item ${isActive ? "help-nav-item-active" : ""}`}>
                          {s.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {filteredCategories.length === 0 && <p className="help-search-empty">No articles match your search.</p>}
        </nav>
      </aside>
    </>
  );
};
