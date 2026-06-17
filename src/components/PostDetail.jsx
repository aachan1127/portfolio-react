import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage, auth } from "../lib/firebase";
import { getYoutubeEmbedUrl } from "./utils/youtube";
import { TagList } from "./TagList";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./PostDetail.css";

// README取得用の関数
const getReadmeUrlCandidates = (githubUrl) => {
  const match = githubUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/);

  if (!match) {
    return [];
  }

  const owner = match[1];
  const repo = match[2];

  return [
    `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/readme.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/readme.md`,
  ];
};

export const PostDetail = ({ title, backLabel, defaultBackPath }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [readmeText, setReadmeText] = useState("");
  const [isReadmeLoading, setIsReadmeLoading] = useState(false);

  const backPath = location.state?.from || defaultBackPath || "/";
  const backButtonLabel =
    backLabel || (backPath === "/posts" ? "全件一覧に戻る" : "ホームに戻る");

  useEffect(() => {
    const getPost = async () => {
      const postSnap = await getDoc(doc(db, "posts", id));
      if (postSnap.exists()) {
        setPost({ ...postSnap.data(), id: postSnap.id });
        setMainIndex(0);
      }
    };
    getPost();
  }, [id]);

  // ログイン者本人だけ true
  const isOwner = post?.author?.id && post.author.id === auth.currentUser?.uid;

  // 削除（PostList の handleDelete と同じ考え方）
  const handleDelete = async () => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    try {
      if (post.imagePaths?.length > 0) {
        for (const path of post.imagePaths) {
          await deleteObject(ref(storage, path));
        }
      }
      await deleteDoc(doc(db, "posts", post.id));
      navigate(backPath);
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    }
  };

  const handlePrevImage = (event) => {
    event.stopPropagation();

    setMainIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const handleNextImage = (event) => {
    event.stopPropagation();

    setMainIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  // READMEを読みにいく
  useEffect(() => {
    const fetchReadme = async () => {
      if (post?.descriptionSource !== "github" || !post?.githubUrl) {
        setReadmeText("");
        return;
      }

      const candidates = getReadmeUrlCandidates(post.githubUrl);

      if (candidates.length === 0) {
        setReadmeText("");
        return;
      }

      try {
        setIsReadmeLoading(true);

        for (const url of candidates) {
          const response = await fetch(url);

          if (response.ok) {
            const text = await response.text();
            setReadmeText(text);
            return;
          }
        }

        setReadmeText("");
      } catch (error) {
        console.error("README取得エラー:", error);
        setReadmeText("");
      } finally {
        setIsReadmeLoading(false);
      }
    };

    fetchReadme();
  }, [post?.githubUrl, post?.descriptionSource]);

  if (!post) {
    return <p className="postDetailLoading">読み込み中...</p>;
  }

  const images = post.imageUrls || [];

  // descriptionSource が "github"かつREADMEが取得できている → READMEを表示
  // それ以外 → 投稿時に入力した説明文を表示
  const descriptionText =
    post.descriptionSource === "github" && readmeText
      ? readmeText
      : post.postText;

  return (
    <div className="postDetailPage">
      {/* 戻る */}
      <button
        type="button"
        className="detailBackButton"
        onClick={() => navigate(backPath)}
      >
        ← {backButtonLabel}
      </button>
      <article className="postDetailCard">
        {/* ページタイトル（例: Works詳細ページ）＝ title プロップ */}
        <p className="detailEyebrow">{title}</p>
        <h1 className="detailTitle">{post.title}</h1>

        <TagList tags={post.tags} />

        {/* URLボタン ＋ 編集・削除（本人のみ） */}
        <div className="detailActionRow">
          {post.siteUrl && (
            <a
              className="detailSiteButton"
              href={post.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              サイトを見る ↗
            </a>
          )}
          {post.githubUrl && (
            <a
              className="detailGithubButton"
              href={post.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHubを見る ↗
            </a>
          )}
          {isOwner && (
            <div className="detailActions">
              <button
                type="button"
                className="detailEditButton"
                onClick={() =>
                  navigate(`/editpost/${post.id}`, {
                    state: {
                      from: location.pathname,
                    },
                  })
                }
              >
                編集
              </button>
              <button
                type="button"
                className="detailDeleteButton"
                onClick={handleDelete}
              >
                削除
              </button>
            </div>
          )}
        </div>

        {/* メイン画像（クリックで拡大）＋ サムネイル切替 */}
        {images.length > 0 && (
          <figure className="detailFigure">
            <button
              type="button"
              className="detailMainImageButton"
              onClick={() => setIsZoomed(true)}
              aria-label="画像を拡大表示"
            >
              <img
                src={images[mainIndex]}
                alt={`${post.title} ${mainIndex + 1}`}
              />
            </button>

            {/* 2枚以上のときだけサムネイル列を表示 */}
            {images.length > 1 && (
              <div className="detailThumbs">
                {images.map((url, index) => (
                  <button
                    type="button"
                    key={index}
                    className={
                      "detailThumb" + (index === mainIndex ? " isActive" : "")
                    }
                    onClick={() => setMainIndex(index)}
                    aria-label={`${index + 1}枚目を表示`}
                    aria-pressed={index === mainIndex}
                  >
                    <img src={url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </figure>
        )}

        {/* 動画（あれば） */}
        {post.videoUrl && (
          <div className="detailVideo">
            <iframe
              src={getYoutubeEmbedUrl(post.videoUrl)}
              title={post.title}
              allowFullScreen
            />
          </div>
        )}

        {/* 説明文（README想定の長文。改行を保持） */}
        <div className="detailDescription markdownBody">
          {isReadmeLoading ? (
            <p>READMEを読み込み中...</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {descriptionText}
            </ReactMarkdown>
          )}
        </div>
      </article>

      {/* ライトボックス */}
      {isZoomed && (
        <div
          className="lightboxOverlay"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="拡大画像"
        >
          {images.length > 1 && (
            <button
              type="button"
              className="lightboxNav lightboxPrev"
              aria-label="前の画像を表示"
              onClick={handlePrevImage}
            >
              ＜
            </button>
          )}

          <img
            src={images[mainIndex]}
            alt={`${post.title} ${mainIndex + 1}`}
            className="lightboxImage"
            onClick={(event) => event.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              className="lightboxNav lightboxNext"
              aria-label="次の画像を表示"
              onClick={handleNextImage}
            >
              ＞
            </button>
          )}

          <button
            type="button"
            className="lightboxClose"
            aria-label="閉じる"
            onClick={(event) => {
              event.stopPropagation();
              setIsZoomed(false);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
