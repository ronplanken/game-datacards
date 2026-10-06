import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const HelpPageNav = ({ prev, next }) => {
  if (!prev && !next) return null;

  return (
    <nav className="help-page-nav">
      {prev ? (
        <Link to={`/help/${prev.category}/${prev.key}`} className="help-page-nav-btn help-page-nav-prev">
          <ChevronLeft size={16} />
          <div className="help-page-nav-text">
            <span className="help-page-nav-label">Previous</span>
            <span className="help-page-nav-title">{prev.label}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link to={`/help/${next.category}/${next.key}`} className="help-page-nav-btn help-page-nav-next">
          <div className="help-page-nav-text">
            <span className="help-page-nav-label">Next</span>
            <span className="help-page-nav-title">{next.label}</span>
          </div>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
};
