import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "../lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
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
  const [skillCategories, setSkillCategories] = useState([]);
  const [skills, setSkills] = useState([]);

  // データ取得・関数を書く
  useEffect(() => {
    // Firestoreからデータを取得する関数
    const getPosts = async () => {
      try {
        const data = await getDocs(collection(db, "posts"));
        setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error("投稿データの取得に失敗しました:", error);
      }
    };

    const getSkillCategories = async () => {
      try {
        const data = await getDocs(collection(db, "skillCategories"));
        setSkillCategories(
          data.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
        );
      } catch (error) {
        console.error("スキルカテゴリデータの取得に失敗しました:", error);
      }
    };

    const getSkills = async () => {
      try {
        const data = await getDocs(collection(db, "skills"));
        setSkills(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error("スキルデータの取得に失敗しました:", error);
      }
    };
    getPosts();
    getSkillCategories();
    getSkills();
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

  // TODO: 後で SkillFormPage.jsx に移動する予定
  const handleUploadSkillIcon = async (skill, file) => {
    if (!file) return;

    try {
      // firestoreのskillsのidとストレージのパスを紐付ける。例: skillIcons/skillId/ファイル名
      const imagePath = `skillIcons/${skill.id}/${file.name}`;
      const imageRef = ref(storage, imagePath);

      await uploadBytes(imageRef, file);

      const downloadUrl = await getDownloadURL(imageRef);

      await updateDoc(doc(db, "skills", skill.id), {
        iconUrl: downloadUrl,
        iconPath: imagePath,
      });

      // skillsのstateも更新する。skillsの中の、アイコンをアップロードしたスキルだけ、iconUrlとiconPathを更新する
      setSkills((prev) =>
        prev.map((item) =>
          item.id === skill.id
            ? { ...item, iconUrl: downloadUrl, iconPath: imagePath }
            : item,
        ),
      );
    } catch (error) {
      console.error("スキルアイコンのアップロードに失敗しました:", error);
      alert("アイコン画像の保存に失敗しました");
    }
  };

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
            <p>
              フロントエンド / バックエンド /<br></br>デザイン /
              アクセシビリティ / UIUX
            </p>

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

              <a
                href="https://connpass.com/user/aachan_1127/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/connpass_icon-removebg.png"
                  alt="コンパスのページを新しいタブで開く"
                  className="connpassIcon"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ----- Study ----- */}
      <section id="study" className="studySection">
        <h2 className="studyTitle">Study</h2>
        {/* メイン枠 */}
        <div className="studyContent">
          <div className="studyMain">
            {mainStudyPost ? (
              <>
                <img
                  src={mainStudyPost.thumbnailUrl}
                  alt={mainStudyPost.title}
                  className="studyMainImage"
                />

                <p className="studyPostTitle">{mainStudyPost.title}</p>
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
          <div className="studyBottom">
            <div className="studySub">
              {subStudyPost ? (
                <>
                  <img
                    src={subStudyPost.thumbnailUrl}
                    alt={subStudyPost.title}
                    className="studySubImage"
                  />

                  <p className="studyPostTitle">{subStudyPost.title}</p>
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

            {/* その他枠 */}
            <div className="studyOthers">
              <p className="studyOthersTitle">その他（一覧）</p>

              <div className="studyOthersGrid">
                {studyOtherRanks.map((rank) => {
                  const post = otherStudyPosts.find(
                    (post) => post.studyDisplayRank === rank,
                  );

                  return (
                    <div key={rank} className="studyOtherItem">
                      {/* <p>その他{rank - 2}番目</p> */}

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
                        <div className="studyOtherPlaceholder">未設定</div>
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
            </div>
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
        </div>

        <div className="sectionButtonArea">
          <button type="button" onClick={() => navigate("/study")}>
            Study一覧を見る
          </button>
        </div>
      </section>

      {/* ----- Works ----- */}
      <section id="works" className="worksSection">
        <h2 className="worksTitle">Works</h2>

        <div className="worksContent">
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
        </div>

        <div className="sectionButtonArea">
          <button type="button" onClick={() => navigate("/works")}>
            Works一覧を見る
          </button>
        </div>

        <div className="sectionButtonArea">
          <button type="button" onClick={() => navigate("/posts")}>
            全投稿一覧を見る
          </button>
        </div>
      </section>

      <section id="skills" className="skillsSection">
        <h2 className="skillsTitle">Skills</h2>

        <div className="skillsContent">
          {skillCategories
            .filter((category) => category.isVisible)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((category) => {
              const categorySkills = skills
                .filter(
                  (skill) =>
                    skill.categoryId === category.id && skill.isVisible,
                )
                .sort((a, b) => a.displayOrder - b.displayOrder);

              return (
                <div className="skillCategory" key={category.id}>
                  <h3 className="skillCategoryTitle">{category.name}</h3>

                  <div className="skillBox">
                    {categorySkills.map((skill) => (
                      <div className="skillItem" key={skill.id}>
                        {skill.iconUrl && (
                        <img
                          src={skill.iconUrl}
                          alt={`${skill.name}のアイコン`}
                          className="skillIcon"
                        />
                        )}
                        {/* {auth.currentUser && (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleUploadSkillIcon(skill, e.target.files[0])
                            }
                          />
                        )} */}

                        <div className="skillText">
                          <p>{skill.description}</p>
                          <button
                            type="button"
                            onClick={() => navigate(`/skills/${skill.id}`)}
                          >
                            この技術を使った代表作品を見る
                          </button>
                          {auth.currentUser && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/skills/${skill.id}/edit`)
                              }
                            >
                              このスキルを変更する
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {auth.currentUser && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/skill-categories/${category.id}/skills/new`)
                      }
                    >
                      新しいスキルを追加
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default Home;
