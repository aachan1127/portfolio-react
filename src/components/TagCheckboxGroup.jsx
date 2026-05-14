import React from "react";
import { TECH_TAGS } from "./utils/tags";

export const TagCheckboxGroup = ({ tags, onChange }) => {
  return (
    <div className="tagCheckboxGroup">
      {TECH_TAGS.map((tag) => (
        <label key={tag} className="tagCheckboxItem">
          <input
            type="checkbox"
            value={tag}
            checked={tags.includes(tag)}
            onChange={onChange}
          />
          {tag}
        </label>
      ))}
    </div>
  );
};
