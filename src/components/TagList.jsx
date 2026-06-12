import React from "react";
import "./TagList.css";

export const TagList = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  const getTagClassName = (tag) => {
    switch (tag) {
      case "HTML":
        return "tagItem tagHtml";
      case "CSS":
        return "tagItem tagCss";
      case "JavaScript":
        return "tagItem tagJavaScript";
      case "jQuery":
        return "tagItem tagJQuery";
      case "React":
        return "tagItem tagReact";
      case "TypeScript":
        return "tagItem tagTypeScript";
      case "WordPress":
        return "tagItem tagWordPress";
      case "Swift":
        return "tagItem tagSwift";
      case "PHP":
        return "tagItem tagPhp";
      case "Laravel":
        return "tagItem tagLaravel";
      case "Docker":
        return "tagItem tagDocker";
      case "Firebase":
        return "tagItem tagFirebase";
      case "AWS":
        return "tagItem tagAws";
      default:
        return "tagItem";
    }
  };

  return (
    <div className="tagList">
      {tags.map((tag) => (
        <span key={tag} className={getTagClassName(tag)}>
          {tag}
        </span>
      ))}
    </div>
  );
};
