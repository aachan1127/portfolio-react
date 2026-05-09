import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const StudyList = () => {
  // stateを用意
  const [studyPosts, setStudyPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getStudyPosts = async () => {
      const data = await getDocs(collection(db, "posts"));
      const posts = data.docs.map((doc) => ({
        ...doc.data(),

        id: doc.id,
      }));

      const studyOnlyPosts = posts
        .filter((post) => post.studyDisplayRank !== null)
        .sort((a, b) => a.studyDisplayRank - b.studyDisplayRank);
      setStudyPosts(studyOnlyPosts);
    };
    getStudyPosts();
  }, []);

  return (
    <div>
      <button type="button" onClick={() => navigate("/")}>
        ホームに戻る
      </button>

      <h1>Study一覧</h1>
      {studyPosts.map((post) => (
        <div key={post.id}>
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            style={{ width: "200px" }}
            onClick={() => navigate(`/study/${post.id}`)}
          />
          <p>{post.title}</p>
        </div>
      ))}
    </div>
  );
};

export default StudyList;
