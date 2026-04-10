import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

export const HelpTableOfContents = () => {
  const location = useLocation();
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef(null);

  const extractHeadings = useCallback(() => {
    const article = document.querySelector(".help-article-body");
    if (!article) return;

    const els = article.querySelectorAll("h2[id], h3[id]");
    if (els.length === 0) return;

    const items = Array.from(els).map((el) => ({
      id: el.id,
      text: el.textContent,
      level: parseInt(el.tagName.charAt(1), 10),
    }));
    setHeadings(items);
  }, []);

  // Extract headings when content mounts or route changes
  useEffect(() => {
    setHeadings([]);
    setActiveId("");

    // Try immediately in case content is already rendered
    extractHeadings();

    // Watch for content appearing via lazy load
    const article = document.querySelector(".help-article-body");
    if (!article) return;

    const mo = new MutationObserver(() => {
      extractHeadings();
    });
    mo.observe(article, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, [location.pathname, extractHeadings]);

  // Track active heading with IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 },
    );
    observerRef.current = observer;

    const elements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="help-toc" aria-label="Table of contents">
      <div className="help-toc-title">On this page</div>
      <nav className="help-toc-nav">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`help-toc-item ${h.level === 3 ? "help-toc-item-indent" : ""} ${activeId === h.id ? "help-toc-item-active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(h.id);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}>
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  );
};
