import React from "react";

export const Figure = ({ src, alt, caption }) => (
  <figure className="help-figure">
    <img src={src} alt={alt || caption || ""} className="help-figure-img" />
    {caption && <figcaption className="help-figure-caption">{caption}</figcaption>}
  </figure>
);
