import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import "./SkillPosts.css";

export const SkillPosts = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [skill, setSkill] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const getSkill = async () => {
      try {
        const skillDoc = await getDoc(doc(db, "skills", skillId));
        const skillData = { ...skillDoc.data(), id: skillDoc.id };
        setSkill(skillData);

        const posts = await Promise.all(
          (skillData.relatedPostIds || []).map(async (postId) => {
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

  // 作品詳細へ（カテゴリで遷移先が変わる。戻り先に今のページを渡す）
  const goToPost = (post) =>
    navigate(
      post.category === "study" ? `/study/${post.id}` : `/works/${post.id}`,
      { state: { from: location.pathname } },
    );

  if (!skill) {
    return <p className="skillPostsLoading">読み込み中...</p>;
  }

  return (
    <div className="skillPostsPage">
      {/* 戻る */}
      <button
        type="button"
        className="skillBackButton"
        onClick={() => navigate("/#skills")}
      >
        ← ホームに戻る
      </button>
      <article className="skillPostsCard">
        {/* スキル名 ＋ できることの説明 */}
        <p className="skillPostsEyebrow">技術詳細</p>
        <h1 className="skillPostsName">{skill.name}</h1>
        <p className="skillPostsDesc">{skill.description}</p>

        {/* 参考作品の見出し */}
        <div className="skillPostsListHead">
          <h2 className="skillPostsListTitle">この技術を使った参考作品</h2>
          <span className="skillPostsCount">{relatedPosts.length}件</span>
        </div>

        {/* 作品リスト */}
        {relatedPosts.length === 0 ? (
          <p className="skillPostsEmpty">
            登録されている作品はまだありません。
          </p>
        ) : (
          <ul className="relatedPostsList">
            {relatedPosts.map((post) => (
              <li className="relatedPostItem" key={post.id}>
                <div className="relatedPostThumb">
                  {post.thumbnailUrl && (
                    <img
                      src={post.thumbnailUrl}
                      alt={`${post.title}のスクリーンショット`}
                    />
                  )}
                </div>
                <div className="relatedPostText">
                  <h3>{post.title}</h3>
                  {/* 作品の説明文は、一覧では一旦表示させないようにする */}
                  {/* <p>{post.postText}</p> */}
                  <div className="relatedPostActions">
                    <button
                      type="button"
                      className="relatedPostDetailLink"
                      onClick={() => goToPost(post)}
                    >
                      作品の詳細を見る <span aria-hidden="true">→</span>
                    </button>
                    {post.siteUrl && (
                      <a
                        className="relatedPostSiteLink"
                        href={post.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        サイトを見る <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
};
