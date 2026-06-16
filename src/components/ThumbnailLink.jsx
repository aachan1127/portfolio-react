import { Link } from "react-router-dom";
import "./ThumbnailLink.css";

export const ThumbnailLink = ({ to, src, title, imageClassName, state }) => {
  return (
    <Link
      to={to}
      state={state}
      className="thumbLink"
      aria-label={`${title} の詳細を見る`}
    >
      <span className="thumbFrame">
        <img src={src} alt="" className={imageClassName} />

        <span className="thumbVeil">
          <span className="thumbLabel">詳細を見る →</span>
        </span>
      </span>
    </Link>
  );
};

export default ThumbnailLink;
