import React from "react";
import { TagList } from "./TagList";
import { getYoutubeEmbedUrl } from "./utils/youtube";
import { auth } from "../lib/firebase";
import "./PostCard.css";

// onDelete, onEdit は PostList.jsx から渡される関数。
// PostCard.jsx は削除・編集の具体的な処理を持たず、親から受け取った関数を実行する。
export const PostCard = ({ post, onClick, onDelete, onEdit }) => {
  return (
    <div className="postContents" onClick={onClick}>
      <div className="postHeader">
        <h1>{post.title}</h1>
      </div>

      <div className="postTextContainer">{post.postText}</div>
      {/* タグ表示 */}
      <TagList tags={post.tags} />

      {/* 画像表示 */}
      {post.imageUrls?.length > 0 ? (
        <div className="postImageListContainer">
          {post.imageUrls.map((url, index) => (
            <div className="postImageContainer" key={index}>
              <img
                src={url}
                alt={`${post.title} ${index + 1}`}
                className="postImage"
              />
            </div>
          ))}
        </div>
      ) : (
        post.imageUrl && (
          <div className="postImageContainer">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="postImage"
            />
          </div>
        )
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

      {/* ↓ post.author?.id === auth.currentUser?.uid && 
                でログインしているユーザーにだけ削除・編集ボタンを表示させる */}
      <div className="nameAndDeleteButton">
        <h3>@{post.author?.name}</h3>
        {post.author?.id === auth.currentUser?.uid && onDelete && (
          <button type="button" onClick={(event) => {
            // 削除ボタンをクリックしたときに、onClick（投稿の詳細ページへの遷移）も発火してしまうのを防ぐために、event.stopPropagation() で制御
            event.stopPropagation();
            onDelete(post);
          }}>
            削除
          </button>
        )}
      </div>

      {post.author?.id === auth.currentUser?.uid && onEdit && (
        <div className="EditButton">
          {/* ナビゲーションは PostList.jsx から渡された onEdit を実行するので、PostCard.jsx には navigate を書かない */}
          <button type="button" onClick={(event) => {
            // 編集ボタンをクリックしたときに、onClick（投稿の詳細ページへの遷移）も発火してしまうのを防ぐために、event.stopPropagation() で制御
            event.stopPropagation();
            onEdit(post);
          }}>
            編集
          </button>
        </div>
      )}
    </div>
  );
};
