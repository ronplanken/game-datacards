import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useUmami } from "../../Hooks/useUmami";
import { helpCategories, helpIconMap } from "./helpSections";

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
        <div className="help-landing-hero">
          <div className="help-landing-badge">
            <span className="help-landing-badge-dot" />
            <span>Docs</span>
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

        <div className="help-landing-grid">
          {helpCategories.map((cat) => {
            const Icon = helpIconMap[cat.icon];
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
