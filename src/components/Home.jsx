import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { TagList } from "./TagList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faXTwitter,
  faFigma,
} from "@fortawesome/free-brands-svg-icons";

export const Home = () => {
  // stateを用意
  const [postList, setPostList] = useState([]);
  const navigate = useNavigate();
  const [selectingSection, setSelectingSection] = useState(null);

  // データ取得・関数を書く
  useEffect(() => {
    // Firestoreからデータを取得する関数
    const getPosts = async () => {
      const data = await getDocs(collection(db, "posts"));
      setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getPosts();
  }, []);

  // YouTubeのURLから埋め込み用のURLを生成する関数 はutils/youtube.jsに移動
  // const getYouTubeEmbedUrl = (url) => {
  //   if (!url) return "";

  //   let videoId = "";

  //   if (url.includes("shorts/")) {
  //     videoId = url.split("shorts/")[1].split("?")[0];
  //   } else if (url.includes("v=")) {
  //     videoId = url.split("v=")[1].split("&")[0];
  //   }

  //   if (!videoId) return "";

  //   return `https://www.youtube.com/embed/${videoId}`;
  // };

  const handleChangeDisplayPost = async (newPost, section, rank) => {
    const rankField =
      section === "study" ? "studyDisplayRank" : "worksDisplayRank";

    try {
      // const currentPost = postList.find((post) => post[rankField] === rank);
      const currentPost = postList.find(
        (post) => post.category === section && post[rankField] === rank,
      );

      if (currentPost && currentPost.id !== newPost.id) {
        await updateDoc(doc(db, "posts", currentPost.id), {
          [rankField]: 7,
        });
      }

      await updateDoc(doc(db, "posts", newPost.id), {
        [rankField]: rank,
      });

      setPostList((prev) =>
        prev.map((post) => {
          if (post.id === currentPost?.id) {
            return { ...post, [rankField]: 7 };
          }

          if (post.id === newPost.id) {
            return { ...post, [rankField]: rank };
          }

          return post;
        }),
      );

      setSelectingSection(null);
    } catch (error) {
      console.error("表示変更エラー:", error);
      alert("表示する投稿の変更に失敗しました");
    }
  };

  console.log("currentUser", auth.currentUser);

  // 画面のどの位置に表示させるかを判断するための値を作る
  const mainStudyPost = postList.find(
    (post) => post.category === "study" && post.studyDisplayRank === 1,
  );
  const subStudyPost = postList.find(
    (post) => post.category === "study" && post.studyDisplayRank === 2,
  );
  // studyDisplayRankが3以上の投稿だけ取り出して、順位順に並べる（その他の画像を判別するため）
  const otherStudyPosts = postList
    .filter(
      (post) =>
        post.category === "study" &&
        post.studyDisplayRank >= 3 &&
        post.studyDisplayRank <= 6,
    )
    .sort((a, b) => a.studyDisplayRank - b.studyDisplayRank);
  // Studyのその他枠を表示するための値。今は4つまで表示させる想定なので、3,4,5,6を用意する。もしその他枠を増やしたい場合はここを増やす。
  const studyOtherRanks = [3, 4, 5, 6];

  // worksDisplayRankも同様に、どの位置に表示させるかを判断するための値を作る
  const mainWorksPost = postList.find(
    (post) => post.category === "works" && post.worksDisplayRank === 1,
  );
  const subWorksPost = postList.find(
    (post) => post.category === "works" && post.worksDisplayRank === 2,
  );

  // ↓今はまだworksの投稿が２つだけなのでここは使わない。２つ以上表示させたい時に使う。
  // const otherWorksPosts = postList
  //   .filter((post) => post.worksDisplayRank >= 3)
  //   .sort((a, b) => a.worksDisplayRank - b.worksDisplayRank);

  // タグを表示するための関数は TagList.jsxにコンポーネント化したのでここでは使わない
  // const renderTags = (tags) => {
  //   if (!tags || tags.length === 0) return null;
  //   return (
  //     <div className="tagList">
  //       {tags.map((tag) => (
  //         <span key={tag} className="tagItem">
  //           {tag}
  //         </span>
  //       ))}
  //     </div>
  //   );
  // };

  // JSXで表示する
  return (
    <div className="homePage">
      <a href="#about">About</a>
      <a href="#study">Study</a>
      <a href="#works">Works</a>
      <a href="#skills">Skills</a>

      <section id="hero" className="heroSection">
        <div className="heroImageArea">
          <img
            src="/akane_photo.JPG"
            alt="山本明音のプロフィール写真"
            className="heroProfileImage"
          />
        </div>

        <div className="heroMessageArea">
          <img
            src="/flower_frame.png"
            alt=""
            aria-hidden="true"
            className="heroFlowerFrame"
          />

          <p className="heroMessage">
            ユーザーの心に寄り添える
            <br />
            エンジニアを目指しています
          </p>
        </div>
      </section>

      <section id="about" className="aboutSection">
        <h2 className="aboutTitle">About</h2>
        <div className="aboutText">
          <p>
            2024年に半年間ジーズアカデミー（現G’s）で未経験からプログラミングを学ぶ。
          </p>
          <p>2025年に学んだ知識を活かし、２件の案件を業務委託で行う。</p>
          <p>
            2026年6月、通っていたスクールで授業のサポート（チューター）を始める。
          </p>
          <p>現在、チューターの傍ら勉強を続け、求職中。</p>
        </div>

        <div className="aboutProfile">
          <div className="aboutImageArea">
            <img
              src="/akane_photo_face.png"
              alt="山本明音の顔写真"
              className="aboutProfileImage"
            />
          </div>

          <div className="aboutProfileText">
            <h3>
              山本　明音
              <span>（やまもと　あかね）</span>
            </h3>
            <p>とくに興味のある分野</p>
            <p>フロントエンド / デザイン / アクセシビリティ / UIUX</p>

            <div className="socialLinks">
              <a
                href="https://github.com/aachan1127"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faGithub}
                  className="socialIcon"
                  aria-label="GitHubを新しいタブで開く"
                />
              </a>

              <a
                href="https://x.com/aachan_y27"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faXTwitter}
                  className="socialIcon"
                  aria-label="Xを新しいタブで開く"
                />
              </a>

              <a
                href="https://www.figma.com/@ac703618_65d6_4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faFigma}
                  className="socialIcon"
                  aria-label="Figmaを新しいタブで開く"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ----- Study ----- */}
      <section id="study">
        <h2>Study</h2>
        {/* メイン枠 */}
        <div className="studyMain">
          {mainStudyPost ? (
            <>
              <img
                src={mainStudyPost.thumbnailUrl}
                alt={mainStudyPost.title}
                className="studyMainImage"
              />

              <p>{mainStudyPost.title}</p>
              <TagList tags={mainStudyPost.tags} />
            </>
          ) : (
            <p>メイン未設定</p>
          )}

          {auth.currentUser && (
            <button
              onClick={() =>
                setSelectingSection({
                  section: "study",
                  rank: 1,
                })
              }
            >
              メイン枠を変更
            </button>
          )}
        </div>

        {/* サブ枠 */}
        <div className="studySub">
          {subStudyPost ? (
            <>
              <img
                src={subStudyPost.thumbnailUrl}
                alt={subStudyPost.title}
                className="studySubImage"
              />

              <p>{subStudyPost.title}</p>
              <TagList tags={subStudyPost.tags} />
            </>
          ) : (
            <p>サブ未設定</p>
          )}

          {auth.currentUser && (
            <button
              onClick={() =>
                setSelectingSection({
                  section: "study",

                  rank: 2,
                })
              }
            >
              サブ枠を変更
            </button>
          )}
        </div>

        {/* ---- モーダル表示 ---- */}
        {selectingSection && (
          <div className="studySelectBox">
            <p>表示する投稿を選んでください</p>

            {postList
              .filter((post) => post.category === selectingSection.section)
              .map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() =>
                    handleChangeDisplayPost(
                      post,
                      selectingSection.section,
                      selectingSection.rank,
                    )
                  }
                >
                  {post.thumbnailUrl && (
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="studySelectImage"
                    />
                  )}
                  <span>{post.title}</span>
                </button>
              ))}

            <button type="button" onClick={() => setSelectingSection(null)}>
              キャンセル
            </button>
          </div>
        )}

        {/* その他枠 */}
        <div className="studyOthers">
          <p>その他</p>

          {studyOtherRanks.map((rank) => {
            const post = otherStudyPosts.find(
              (post) => post.studyDisplayRank === rank,
            );

            return (
              <div key={rank} className="studyOtherItem">
                <p>その他{rank - 2}番目</p>

                {post ? (
                  <>
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="studyOtherImage"
                    />
                    <p>{post.title}</p>
                  </>
                ) : (
                  <p>未設定</p>
                )}

                {auth.currentUser && (
                  <button
                    onClick={() =>
                      setSelectingSection({
                        section: "study",
                        rank: rank,
                      })
                    }
                  >
                    この枠を変更
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button type="button" onClick={() => navigate("/study")}>
          Study一覧を見る
        </button>
      </section>

      {/* ----- Works ----- */}
      <section id="works">
        <h2>Works</h2>

        {/* Worksメイン枠 */}
        <div className="worksMain">
          {mainWorksPost ? (
            <>
              <img
                src={mainWorksPost.thumbnailUrl}
                alt={mainWorksPost.title}
                className="worksMainImage"
              />

              <p>{mainWorksPost.title}</p>
              <TagList tags={mainWorksPost.tags} />
            </>
          ) : (
            <p>Worksメイン未設定</p>
          )}

          {auth.currentUser && (
            <button
              onClick={() =>
                setSelectingSection({
                  section: "works",
                  rank: 1,
                })
              }
            >
              Worksメイン枠を変更
            </button>
          )}
        </div>

        {/* Works サブ枠 */}
        <div className="worksSub">
          {subWorksPost ? (
            <>
              <img
                src={subWorksPost.thumbnailUrl}
                alt={subWorksPost.title}
                className="worksSubImage"
              />

              <p>{subWorksPost.title}</p>
              <TagList tags={subWorksPost.tags} />
            </>
          ) : (
            <p>Worksサブ未設定</p>
          )}

          {auth.currentUser && (
            <button
              onClick={() =>
                setSelectingSection({
                  section: "works",
                  rank: 2,
                })
              }
            >
              Worksサブ枠を変更
            </button>
          )}
        </div>

        <button type="button" onClick={() => navigate("/works")}>
          Works一覧を見る
        </button>

        <button type="button" onClick={() => navigate("/posts")}>
          全投稿一覧を見る
        </button>
      </section>

      <section id="skills">
        <h2>Skills</h2>
      </section>
    </div>
  );
};

export default Home;
