import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { TECH_TAGS } from "./utils/tags";
import { PostCard } from "./PostCard";
import "./Home.css";
import { storage } from "../lib/firebase";
import { ref, deleteObject } from "firebase/storage";

export const PostList = ({ category, title }) => {
  const [posts, setPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getPosts = async () => {
      const data = await getDocs(collection(db, "posts"));

      const allPosts = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const categoryPosts =
        category === "all"
          ? allPosts
          : allPosts.filter((post) => post.category === category);

      setPosts(categoryPosts);
    };

    getPosts();
  }, [category]);

  const handleDelete = async (post) => {
    const isConfirmed = window.confirm("この投稿を削除しますか？");

    if (!isConfirmed) {
      return;
    }

    // 削除処理
    try {
      // ① Storage の画像削除
      if (post.imagePaths && post.imagePaths.length > 0) {
        for (const path of post.imagePaths) {
          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
        }
      }

      // ② Firestore 削除
      await deleteDoc(doc(db, "posts", post.id));

      // 画面更新
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    }
  };

  const filteredPosts = posts.filter((post) =>
    selectedTag ? post.tags?.includes(selectedTag) : true,
  );

  return (
    <div className="homePage">
      <button type="button" onClick={() => navigate("/")}>
        ホームに戻る
      </button>

      <h1>{title}</h1>

      <div className="tagFilterArea">
        <button type="button" onClick={() => setSelectedTag("")}>
          すべて
        </button>

        {TECH_TAGS.map((tag) => (
          <button type="button" key={tag} onClick={() => setSelectedTag(tag)}>
            {tag}
          </button>
        ))}
      </div>

      {filteredPosts.map((post) => (
        // PostCardコンポーネントをクリックしたときの挙動
        <PostCard
          key={post.id}
          post={post}
          onClick={() =>
            navigate(
              post.category === "study"
                ? `/study/${post.id}`
                : `/works/${post.id}`,
              {
                state: {
                  from: category === "all" ? "/posts" : `/${post.category}`,
                },
              },
            )
          }
          // 削除・編集ボタンの挙動
          onDelete={handleDelete}
          onEdit={(post) => navigate(`/editpost/${post.id}`)}
        />
      ))}
    </div>
  );
};
