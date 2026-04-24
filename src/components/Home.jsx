import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { storage } from "../lib/firebase";
import { ref, deleteObject } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export const Home = () => {
  const [postList, setPostList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getPosts = async () => {
      const data = await getDocs(collection(db, "posts"));
      setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getPosts();
  }, []);

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

  const handleDelete = async (post) => {
    try {
      // 🔥 ① Storage の画像削除
      if (post.imagePaths && post.imagePaths.length > 0) {
        for (const path of post.imagePaths) {
          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
        }
      }

      // 🔥 ② Firestore 削除
      await deleteDoc(doc(db, "posts", post.id));

      // 🔄 画面更新
      window.location.href = "/";
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    }
  };

  console.log("currentUser", auth.currentUser);
  return (
    <div className="homePage">
      {postList.map((post) => {
        return (
          <div className="postContents" key={post.id}>
            <div className="postHeader">
              <h1>{post.title}</h1>
            </div>

            <div className="postTextContainer">{post.postText}</div>

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
                  src={getYouTubeEmbedUrl(post.videoUrl)}
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
              {post.author?.id === auth.currentUser?.uid && (
                <button onClick={() => handleDelete(post)}>削除</button>
              )}
            </div>

            {post.author?.id === auth.currentUser?.uid && (
              <div className="EditButton">
                <button onClick={() => navigate(`/editpost/${post.id}`)}>
                  編集
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Home;
