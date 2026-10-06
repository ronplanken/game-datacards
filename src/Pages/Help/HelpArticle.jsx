import React, { Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { MDXProvider } from "@mdx-js/react";
import { ChevronRight } from "lucide-react";
import { mdxComponents } from "./components/mdxComponents";
import { HelpTableOfContents } from "./components/HelpTableOfContents";
import { HelpPageNav } from "./components/HelpPageNav";
import { getCategory, getSection, getSectionNeighbors } from "./helpSections";

const ArticleErrorFallback = ({ resetErrorBoundary }) => (
  <div className="help-article-error">
    <p>Failed to load this article.</p>
    <button className="help-back-btn" onClick={resetErrorBoundary}>
      Try again
    </button>
  </div>
);

export const HelpArticle = () => {
  const { category, slug } = useParams();
  const cat = getCategory(category);
  const section = getSection(category, slug);

  if (!cat || !section) {
    return (
      <main className="help-content">
        <div className="help-content-inner">
          <h2>Article not found</h2>
          <p>This article may have been moved or removed. Browse all docs to find what you are looking for.</p>
          <p>
            <Link to="/help">Browse docs</Link>
          </p>
        </div>
      </main>
    );
  }

  const { prev, next } = getSectionNeighbors(category, slug);
  const Component = section.component;

  return (
    <main className="help-content">
      <div className="help-article-layout">
        <article className="help-article">
          <nav className="help-breadcrumb" aria-label="Breadcrumb">
            <Link to="/help" className="help-breadcrumb-link">
              Docs
            </Link>
            <ChevronRight size={12} />
            <span className="help-breadcrumb-category">{cat.label}</span>
            <ChevronRight size={12} />
            <span className="help-breadcrumb-current">{section.label}</span>
          </nav>

          <header className="help-article-header">
            <h1 className="help-article-title">{section.label}</h1>
            {section.description && <p className="help-article-description">{section.description}</p>}
          </header>

          <div className="help-article-body">
            <MDXProvider components={mdxComponents}>
              <ErrorBoundary FallbackComponent={ArticleErrorFallback} resetKeys={[category, slug]}>
                <Suspense fallback={<div className="help-section-loading">Loading article...</div>}>
                  <Component />
                </Suspense>
              </ErrorBoundary>
            </MDXProvider>
          </div>

          <HelpPageNav prev={prev} next={next} />
        </article>

        <HelpTableOfContents />
      </div>
    </main>
  );
};
