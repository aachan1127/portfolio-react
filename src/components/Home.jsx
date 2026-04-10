import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { storage } from "../lib/firebase";
import { ref, deleteObject } from "firebase/storage";
import "./Home.css";

export const Home = () => {
  const [postList, setPostList] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      const data = await getDocs(collection(db, "posts"));
      setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getPosts();
  }, []);

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

            <div className="nameAndDeleteButton">
              <h3>@{post.author?.name}</h3>
              {post.author?.id === auth.currentUser?.uid && (
                <button onClick={() => handleDelete(post)}>削除</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
