import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const WorksList = () => {
  // stateを用意
  const [worksPosts, setWorksPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getWorksPosts = async () => {
      const data = await getDocs(collection(db, "posts"));
      const posts = data.docs.map((doc) => ({
        ...doc.data(),

        id: doc.id,
      }));

      // categoryが"works"のものだけを抽出してstateにセットする
      const worksOnlyPosts = posts.filter((post) => post.category === "works");
      setWorksPosts(worksOnlyPosts);
    };
    getWorksPosts();
  }, []);

  return (
    <div>
      <button type="button" onClick={() => navigate("/")}>
        ホームに戻る
      </button>

      <h1>Works一覧</h1>
      {worksPosts.map((post) => (
        <div key={post.id}>
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            style={{ width: "200px" }}
            onClick={() => navigate(`/works/${post.id}`)}
          />
          <p>{post.title}</p>
        </div>
      ))}
    </div>
  );
};

export default WorksList;
