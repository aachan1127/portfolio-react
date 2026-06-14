import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { TECH_TAGS } from "./utils/tags";
import { PostCard } from "./PostCard";
import "./Home.css";
import "./PostList.css";
import { storage } from "../lib/firebase";
import { ref, deleteObject } from "firebase/storage";

export const PostList = ({ category, title }) => {
  const [posts, setPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
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

  // タグフィルタリング
  const filteredPosts = posts.filter((post) => {
    if (selectedTag.length === 0) {
      return true;
    }
    return selectedTag.some((tag) => post.tags?.includes(tag));
  });

  return (
    <div className="homePage">
      <button
        className="backButton"
        type="button"
        onClick={() => navigate("/")}
      >
        ← ホームに戻る
      </button>

      <h1 className="pageTitle">{title}</h1>

      <div className="listToolbar">
        <div className="tagFilterArea">
          <button
            className={`tagFilterButton ${
              selectedTag.length === 0 ? "isActive" : ""
            }`}
            type="button"
            onClick={() => setSelectedTag([])}
          >
            すべて
          </button>

          {TECH_TAGS.map((tag) => (
            <button
              className={`tagFilterButton ${
                selectedTag.includes(tag) ? "isActive" : ""
              }`}
              type="button"
              key={tag}
              onClick={() => {
                if (selectedTag.includes(tag)) {
                  // すでに選択されているタグをクリックした場合は、選択解除する
                  setSelectedTag(selectedTag.filter((item) => item !== tag));
                } else {
                  // 新しいタグを選択する場合は、既存の選択に追加する
                  setSelectedTag([...selectedTag, tag]);
                }
              }}
            >
              {tag}
            </button>
          ))}
        </div>
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
