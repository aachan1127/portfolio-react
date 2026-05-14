import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { TECH_TAGS } from "./utils/tags";
import { TagList } from "./TagList";
import "./Home.css";

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

  const filteredPosts = posts.filter((post) =>
    selectedTag ? post.tags?.includes(selectedTag) : true,
  );

  return (
    <div>
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
        <div key={post.id}>
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            style={{ width: "200px" }}
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
          />

          <p>{post.title}</p>
          <TagList tags={post.tags} />
        </div>
      ))}
    </div>
  );
};
