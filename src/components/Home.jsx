import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { storage } from "../lib/firebase";
import { ref, deleteObject } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { getYoutubeEmbedUrl } from "./utils/youtube";
import "./Home.css";

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

  const handleDelete = async (post) => {
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
      setPostList((prev) => prev.filter((item) => item.id !== post.id));
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    }
  };

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

  // JSXで表示する
  return (
    <div className="homePage">
      {/* ----- Study ----- */}
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

      {/* ----- Works ----- */}
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

      {postList.map((post) => {
        return (
          <div className="postContents" key={post.id}>
            <div className="postHeader">
              <h1>{post.title}</h1>
            </div>

            <div className="postTextContainer">{post.postText}</div>

            {/* 画像表示 */}
            {post.imageUrls?.length > 0 ? (
              <div className="postImageListContainer">
                {post.imageUrls.map((url, index) => (
                  <div className="postImageContainer" key={index}>
                    <img
                      src={url}
                      alt={`${post.title} ${index + 1}`}
                      className="postImage"
                    />
                  </div>
                ))}
              </div>
            ) : (
              post.imageUrl && (
                <div className="postImageContainer">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="postImage"
                  />
                </div>
              )
            )}

            {/* 動画表示 */}
            {post.videoUrl && (
              <div className="postVideoContainer">
                <iframe
                  src={getYoutubeEmbedUrl(post.videoUrl)}
                  title={post.title}
                  className="postVideo"
                  allowFullScreen
                />
              </div>
            )}

            {/* ↓ post.author?.id === auth.currentUser?.uid && 
                でログインしているユーザーにだけ削除・編集ボタンを表示させる */}
            <div className="nameAndDeleteButton">
              <h3>@{post.author?.name}</h3>
              {post.author?.id === auth.currentUser?.uid && (
                <button onClick={() => handleDelete(post)}>削除</button>
              )}
            </div>

            {post.author?.id === auth.currentUser?.uid && (
              <div className="EditButton">
                <button onClick={() => navigate(`/editpost/${post.id}`)}>
                  編集
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Home;
