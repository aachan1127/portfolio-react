import React from "react";

export const TagList = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="tagList">
      {tags.map((tag) => (
        <span key={tag} className="tagItem">
          {tag}
        </span>
      ))}
    </div>
  );
};
