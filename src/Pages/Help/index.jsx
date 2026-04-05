import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Database, PenTool, CreditCard, Cloud, Wrench } from "lucide-react";
import { useUmami } from "../../Hooks/useUmami";
import { helpCategories } from "./helpSections";

const iconMap = {
  Database,
  PenTool,
  CreditCard,
  Cloud,
  Wrench,
};

export { HelpLayout } from "./HelpLayout";
export { HelpArticle } from "./HelpArticle";

export const HelpLanding = () => {
  const { trackEvent } = useUmami();

  useEffect(() => {
    trackEvent("help-view", {});
  }, [trackEvent]);

  return (
    <main className="help-landing">
      <div className="help-landing-inner">
        {/* Hero */}
        <div className="help-landing-hero">
          <div className="help-landing-badge">
            <span className="help-landing-badge-dot" />
            <span>Documentation</span>
          </div>
          <h1 className="help-landing-title">
            How to use
            <br />
            <span className="help-landing-title-accent">Game Datacards</span>
          </h1>
          <p className="help-landing-subtitle">
            Everything you need to create custom datasources and design card templates for your tabletop games.
          </p>
        </div>

        {/* Category cards grid */}
        <div className="help-landing-grid">
          {helpCategories.map((cat) => {
            const Icon = iconMap[cat.icon];
            const firstSection = cat.sections[0];
            if (!firstSection) return null;

            return (
              <Link key={cat.key} to={`/help/${cat.key}/${firstSection.key}`} className="help-category-card">
                <div className="help-category-card-icon">{Icon && <Icon size={18} />}</div>
                <div className="help-category-card-content">
                  <h2 className="help-category-card-title">{cat.label}</h2>
                  <p className="help-category-card-desc">{cat.description}</p>
                  <span className="help-category-card-count">
                    {cat.sections.length} {cat.sections.length === 1 ? "article" : "articles"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
};
