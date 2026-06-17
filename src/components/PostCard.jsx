import React from "react";
import { TagList } from "./TagList";
import { getYoutubeEmbedUrl } from "./utils/youtube";
import { auth } from "../lib/firebase";
import "./PostCard.css";
import AdminButton from "./Button/AdminButton";

// onDelete, onEdit は PostList.jsx から渡される関数。
// PostCard.jsx は削除・編集の具体的な処理を持たず、親から受け取った関数を実行する。
export const PostCard = ({ post, onClick, onDelete, onEdit }) => {
  const displayImage =
    post.thumbnailUrl || post.imageUrls?.[0] || post.imageUrl;

  return (
    <div className="postContents" onClick={onClick}>
      <div className="postImageArea">
        {/* 画像表示 */}
        {displayImage ? (
          <img src={displayImage} alt={post.title} className="postImage" />
        ) : (
          <div className="postImagePlaceholder">投稿画像</div>
        )}

        {/* 動画表示 */}
        {post.videoUrl && (
          <div className="postVideoContainer">
            <iframe
              src={getYoutubeEmbedUrl(post.videoUrl)}
              title={post.title}
              className="postVideo"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* 投稿のタイトルと本文 */}
      <div className="postBody">
          <p className="postMeta">
            {post.category?.toUpperCase()} ・{" "}
            {post.workDate
              ? post.workDate.replaceAll("-", "/")
              : "作成日未設定"}
          </p>

        <h3 className="postTitle">{post.title}</h3>
        {/* タグ表示 */}
        <TagList tags={post.tags} />

        {/* ↓ post.author?.id === auth.currentUser?.uid && 
                でログインしているユーザーにだけ削除・編集ボタンを表示させる */}
        <div className="postActionButtons">
          {post.author?.id === auth.currentUser?.uid && onEdit && (
            <div className="EditButton">
              {/* ナビゲーションは PostList.jsx から渡された onEdit を実行するので、PostCard.jsx には navigate を書かない */}
              <AdminButton
                type="button"
                onClick={(event) => {
                  // 編集ボタンをクリックしたときに、onClick（投稿の詳細ページへの遷移）も発火してしまうのを防ぐために、event.stopPropagation() で制御
                  event.stopPropagation();
                  onEdit(post);
                }}
              >
                編集
              </AdminButton>
            </div>
          )}

          {post.author?.id === auth.currentUser?.uid && onDelete && (
            <button
              className="DeleteButton"
              type="button"
              onClick={(event) => {
                // 削除ボタンをクリックしたときに、onClick（投稿の詳細ページへの遷移）も発火してしまうのを防ぐために、event.stopPropagation() で制御
                event.stopPropagation();
                onDelete(post);
              }}
            >
              削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
