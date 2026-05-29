import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import "./SkillPosts.css";

export const SkillPosts = () => {
  const { skillId } = useParams();

  const [skill, setSkill] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const getSkill = async () => {
      try {
        const skillDoc = await getDoc(doc(db, "skills", skillId));

        const skillData = { ...skillDoc.data(), id: skillDoc.id };
        setSkill(skillData);

        const posts = await Promise.all(
          skillData.relatedPostIds.map(async (postId) => {
            const postDoc = await getDoc(doc(db, "posts", postId));
            return { ...postDoc.data(), id: postDoc.id };
          }),
        );

        setRelatedPosts(posts);
      } catch (error) {
        console.error("スキルデータの取得に失敗しました:", error);
      }
    };
    getSkill();
  }, [skillId]);

  return (
    <div className="skillPostsPage">
      <h1 className="skillPostsTitle">この技術を使った代表作品</h1>
      <div className="skillPostsIntro">
        <p>スキル名: {skill?.name}</p>
        <p>説明: {skill?.description}</p>
      </div>

      <h2 className="relatedPostsTitle">関連する投稿</h2>
      {/* firestore のpostsのIDを skillsのrelatedPostIdsに紐付け（記録）してここで表示させる*/}
      <ul className="relatedPostsList">
        {relatedPosts.map((post) => (
          <li className="relatedPostItem" key={post.id}>
            {post.thumbnailUrl && (
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="skillPostThumbnail"
              />
            )}
            <div className="relatedPostText">
              <h3>{post.title}</h3>
              <p>{post.postText}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
