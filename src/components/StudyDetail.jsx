import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const StudyDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

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

  return (
    <div>
      <h1>Study詳細ページ</h1>

      <p>投稿ID: {id}</p>
      <p>{post?.title}</p>
      <p>{post?.postText}</p>

      {post?.imageUrls?.length > 0 && (
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
