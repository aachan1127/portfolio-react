import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getYoutubeEmbedUrl } from "./utils/youtube";
import { TagList } from "./TagList";

export const PostDetail = ({ title, backLabel, defaultBackPath }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const backPath = location.state?.from || defaultBackPath || "/";
  const backButtonLabel =
    backLabel || (backPath === "/posts" ? "全件一覧に戻る" : "ホームに戻る");

  useEffect(() => {
    const getPost = async () => {
      const postRef = doc(db, "posts", id);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        setPost({
          ...postSnap.data(),
          id: postSnap.id,
        });
      }
    };

    getPost();
  }, [id]);

  if (!post) {
    return <p>読み込み中...</p>;
  }

  return (
    <div>
      <button type="button" onClick={() => navigate(backPath)}>
        {backButtonLabel}
      </button>

      <h1>{title || post.title}</h1>

      <p>投稿ID: {id}</p>
      <p>{post.title}</p>
      <p>{post.postText}</p>

      <TagList tags={post.tags} />

      {post.imageUrls?.length > 0 && (
        <div>
          {post.imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${post.title} ${index + 1}`}
              style={{ width: "300px" }}
            />
          ))}
        </div>
      )}

      {post.videoUrl && (
        <iframe
          src={getYoutubeEmbedUrl(post.videoUrl)}
          title={post.title}
          style={{ width: "300px", height: "200px" }}
          allowFullScreen
        />
      )}
    </div>
  );
};

export default PostDetail;
