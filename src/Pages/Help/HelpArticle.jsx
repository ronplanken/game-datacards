import React, { Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { MDXProvider } from "@mdx-js/react";
import { ChevronRight } from "lucide-react";
import { mdxComponents } from "./components/mdxComponents";
import { HelpTableOfContents } from "./components/HelpTableOfContents";
import { HelpPageNav } from "./components/HelpPageNav";
import { getCategory, getSection, getSectionNeighbors } from "./helpSections";

export const HelpArticle = () => {
  const { category, slug } = useParams();
  const cat = getCategory(category);
  const section = getSection(category, slug);

  if (!cat || !section) {
    return (
      <main className="help-content">
        <div className="help-content-inner">
          <h2>Article not found</h2>
          <p>
            <Link to="/help">Back to Help</Link>
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
        {/* Article */}
        <article className="help-article">
          {/* Breadcrumb */}
          <nav className="help-breadcrumb">
            <Link to="/help" className="help-breadcrumb-link">
              Docs
            </Link>
            <ChevronRight size={12} />
            <span className="help-breadcrumb-category">{cat.label}</span>
            <ChevronRight size={12} />
            <span className="help-breadcrumb-current">{section.label}</span>
          </nav>

          {/* Page header */}
          <header className="help-article-header">
            <h1 className="help-article-title">{section.label}</h1>
            {section.description && <p className="help-article-description">{section.description}</p>}
          </header>

          {/* MDX content */}
          <div className="help-article-body">
            <MDXProvider components={mdxComponents}>
              <Suspense fallback={<div className="help-section-loading" />}>
                <Component />
              </Suspense>
            </MDXProvider>
          </div>

          {/* Prev/Next navigation */}
          <HelpPageNav prev={prev} next={next} />
        </article>

        {/* Table of Contents — directly right of article */}
        <HelpTableOfContents />
      </div>
    </main>
  );
};
