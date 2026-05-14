import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { TagList } from "./TagList";
import { TECH_TAGS } from "./utils/tags";

const StudyList = () => {
  // stateを用意
  const [studyPosts, setStudyPosts] = useState([]);
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    const getStudyPosts = async () => {
      const data = await getDocs(collection(db, "posts"));
      const posts = data.docs.map((doc) => ({
        ...doc.data(),

        id: doc.id,
      }));

      // categoryが"study"のものだけを抽出してstateにセットする
      const studyOnlyPosts = posts.filter((post) => post.category === "study");
      setStudyPosts(studyOnlyPosts);
    };
    getStudyPosts();
  }, []);

  const filteredStudyPosts = studyPosts.filter((post) =>
    selectedTag ? post.tags?.includes(selectedTag) : true,
  );

  return (
    <div>
      <button type="button" onClick={() => navigate("/")}>
        ホームに戻る
      </button>

      <h1>Study一覧</h1>

      <div className="tagFilterArea">
        <button type="button" onClick={() => setSelectedTag("")}>
          すべて
        </button>
        {/* タグフィルター（タグボタンは TECH_TAGS から自動生成） */}
        {TECH_TAGS.map((tag) => (
          <button type="button" key={tag} onClick={() => setSelectedTag(tag)}>
            {tag}
          </button>
        ))}
      </div>

      {filteredStudyPosts.map((post) => (
        <div key={post.id}>
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            style={{ width: "200px" }}
            onClick={() => navigate(`/study/${post.id}`)}
          />
          <p>{post.title}</p>
          <TagList tags={post.tags} />
        </div>
      ))}
    </div>
  );
};

export default StudyList;
