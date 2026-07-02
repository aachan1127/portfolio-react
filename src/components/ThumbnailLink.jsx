import { Link } from "react-router-dom";
import "./ThumbnailLink.css";

export const ThumbnailLink = ({
  to,
  state,
  src,
  title,
  imageClassName,
  titleClassName,
}) => {
  return (
    <Link
      to={to}
      state={state}
      className="thumbnailLink"
      aria-label={`${title} の詳細を見る`}
    >
      <span className="thumbnailInner">
        <span className="thumbnailThumbFrame">
          <img src={src} alt="" className={imageClassName} />
          <span className="thumbnailVeil" aria-hidden="true">
            <span className="thumbnailLabel">詳細を見る →</span>
          </span>
        </span>

        <h3 className={titleClassName}>{title}</h3>
      </span>
    </Link>
  );
};

export default ThumbnailLink;
