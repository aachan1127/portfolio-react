import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const StudyDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();

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

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("shorts/")) {
      videoId = url.split("shorts/")[1].split("?")[0];
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    }
    if (!videoId) return "";
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // ここで return することで、その下の処理には進まないようにする
  if (!post) {
    return <p>読み込み中...</p>;
  }

  // postの取得ができたら下記を表示する
  return (
    <div>
      <button type="button" onClick={() => navigate("/study")}>
        Study一覧に戻る
      </button>

      <h1>Study詳細ページ</h1>

      <p>投稿ID: {id}</p>
      <p>{post.title}</p>
      <p>{post.postText}</p>

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

          {post?.videoUrl && (
            <iframe
              src={getYouTubeEmbedUrl(post.videoUrl)}
              title={post.title}
              style={{ width: "300px", height: "200px" }}
              allowFullScreen
            />
          )}
        </div>
      )}
    </div>
  );
};

export default StudyDetail;
