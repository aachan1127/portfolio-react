import React, { useEffect, useState } from "react";
import "./PostForm.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, storage } from "../lib/firebase";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { TagCheckboxGroup } from "./TagCheckboxGroup";

const EditPost = () => {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [category, setCategory] = useState("study");
  const [displayType, setDisplayType] = useState("list");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const getPost = async () => {
      try {
        // Firestore から投稿を1件取る
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        // ↓その投稿が本当に存在するか確認している
        if (docSnap.exists()) {
          // 投稿データを取り出す
          const data = docSnap.data();
          // 取得したデータをstateにセットする
          setTitle(data.title);
          setPostText(data.postText);
          setCategory(data.category || "study");
          setTags(data.tags || []);

          // displayRank を取得
          const displayRank =
            data.category === "study"
              ? data.studyDisplayRank
              : data.worksDisplayRank;

          // select 用の state に変換
          if (displayRank === 7 || displayRank == null) {
            setDisplayType("list");
          } else {
            setDisplayType(String(displayRank));
          }

          const imageData = (data.imageUrls || []).map((url, index) => ({
            url: url,
            path: data.imagePaths?.[index] || "",
            fileName: data.imageFileNames?.[index] || "",
          }));

          // 取得したデータをstateにセットする
          setExistingImages(imageData);
          // 取得したデータをoriginalImagesにもセットする（後で既存画像と比較するため）
          setOriginalImages(imageData);
        } else {
          console.log("投稿が存在しません");
        }
      } catch (error) {
        console.error("取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getPost();
  }, [id]);

  // ↓既存画像を消す関数
  const handleRemoveExistingImage = (targetIndex) => {
    setExistingImages((prev) =>
      prev.filter((_, index) => index !== targetIndex),
    );
  };

  // 並び替え（上）
  const moveExistingImageUp = (index) => {
    if (index === 0) return;

    setExistingImages((prev) => {
      const newImages = [...prev];
      [newImages[index - 1], newImages[index]] = [
        newImages[index],
        newImages[index - 1],
      ];
      return newImages;
    });
  };

  // 並び替え（下）
  const moveExistingImageDown = (index) => {
    setExistingImages((prev) => {
      if (index === prev.length - 1) return prev;

      const newImages = [...prev];
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      return newImages;
    });
  };

  // ↓選択した画像を消す関数
  const handleRemoveSelectedImage = (targetId) => {
    setSelectedImages((prev) => {
      const target = prev.find((image) => image.id === targetId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((image) => image.id !== targetId);
    });
  };

  // ↓新しい画像を選んだときの処理（CreatePostと同じ）
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }

    const newImages = files.map((file) => ({
      id: `${Date.now()}_${file.name}_${Math.random().toString(16).slice(2)}`,
      file: file,
      fileName: file.name,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);

    e.target.value = "";
  };

  // タグ変更用の関数
  const handleTagChange = (e) => {
    const tag = e.target.value;
    if (e.target.checked) {
      setTags((prev) => [...prev, tag]);
    } else {
      setTags((prev) => prev.filter((item) => item !== tag));
    }
  };

  // ↓ 更新ボタン押した時の処理
  const navigate = useNavigate();

  const updatePost = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してね");
      return;
    }

    if (!postText.trim()) {
      alert("説明を入力してね");
      return;
    }

    try {
      setIsSubmitting(true);

      if (!auth.currentUser) {
        alert("ログイン情報が見つかりません");
        navigate("/login");
        return;
      }

      const uid = auth.currentUser.uid;
      const updatedImageUrls = existingImages.map((image) => image.url);
      const updatedImagePaths = existingImages.map((image) => image.path);
      const updatedImageFileNames = existingImages.map(
        (image) => image.fileName,
      );

      // ① 削除対象を取得(既存画像とoriginalImagesを比較して、削除された画像を特定する
      const deletedImages = originalImages.filter(
        (original) =>
          !existingImages.some((current) => current.path === original.path),
      );

      const docRef = doc(db, "posts", id);

      // 新しい画像をStorageにアップロードしてURLを取得する（CreatePostと同じ）
      const newImageUrls = [];
      const newImagePaths = [];
      const newImageFileNames = [];

      for (const image of selectedImages) {
        const file = image.file;
        const fileName = `${Date.now()}_${file.name}`;
        const imageRef = ref(storage, `postImages/${uid}/${fileName}`);

        await uploadBytes(imageRef, file);

        const url = await getDownloadURL(imageRef);

        newImageUrls.push(url);
        newImagePaths.push(imageRef.fullPath);
        newImageFileNames.push(file.name);
      }

      const finalImageUrls = [...updatedImageUrls, ...newImageUrls];
      const finalImagePaths = [...updatedImagePaths, ...newImagePaths];
      const finalImageFileNames = [
        ...updatedImageFileNames,
        ...newImageFileNames,
      ];
      // displayType を Firestore 用に変換
      const displayRank = displayType === "list" ? 7 : Number(displayType);

      // ② 同じ表示位置に既にある投稿を取得して、表示位置を7（一覧のみ）に更新する
      if (displayRank >= 1 && displayRank <= 6) {
        const postsCollectionRef = collection(db, "posts");
        const rankField =
          category === "study" ? "studyDisplayRank" : "worksDisplayRank";
        const data = await getDocs(postsCollectionRef);
        const currentPost = data.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          .find(
            (post) =>
              post.id !== id &&
              post.category === category &&
              post[rankField] === displayRank,
          );
        if (currentPost) {
          const displayLabelMap = {
            1: "メイン",
            2: "サブ",
            3: "その他1番目",
            4: "その他2番目",
            5: "その他3番目",
            6: "その他4番目",
          };
          const isConfirmed = window.confirm(
            `${displayLabelMap[displayRank]}の画像を入れ替えますか？`,
          );
          if (!isConfirmed) {
            return;
          }
          await updateDoc(doc(db, "posts", currentPost.id), {
            [rankField]: 7,
          });
        }
      }

      // ③ Firestore更新
      await updateDoc(docRef, {
        title: title,
        postText: postText,
        category: category,
        tags: tags,
        studyDisplayRank: category === "study" ? displayRank : 7,
        worksDisplayRank: category === "works" ? displayRank : 7,
        imageUrls: finalImageUrls,
        imagePaths: finalImagePaths,
        imageFileNames: finalImageFileNames,
        updatedAt: serverTimestamp(),
      });

      // ④ Firestore更新後に、不要になった既存画像をStorageから削除
      if (deletedImages.length > 0) {
        for (const image of deletedImages) {
          const imageRef = ref(storage, image.path);
          await deleteObject(imageRef);
        }
      }

      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });

      navigate("/");
    } catch (error) {
      console.error("更新エラー:", error);
      alert("更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="postFormPage">
      <div className="postContainer">
        <h1>記事を編集する</h1>

        <div className="inputPost">
          <div>タイトル</div>
          <input
            type="text"
            placeholder="タイトルを記入"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="inputPost">
          <div>説明</div>
          <textarea
            placeholder="説明を記入"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          ></textarea>
        </div>

        <div className="inputPost">
          <div>カテゴリ</div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="study">Study</option>
            <option value="works">Works</option>
          </select>
        </div>

        <div className="inputPost">
          <div>表示位置</div>

          <select
            value={displayType}
            onChange={(e) => setDisplayType(e.target.value)}
          >
            <option value="list">一覧のみ</option>
            {category === "study" ? (
              <>
                <option value="1">Study メイン</option>
                <option value="2">Study サブ</option>
                <option value="3">Study その他1</option>
                <option value="4">Study その他2</option>
                <option value="5">Study その他3</option>
                <option value="6">Study その他4</option>
              </>
            ) : (
              <>
                <option value="1">Works メイン</option>
                <option value="2">Works サブ</option>
              </>
            )}
          </select>
        </div>

        <div className="inputPost">
          <div>使用技術タグ</div>

          <div className="tagCheckboxGroup">
            {/* 重複しているタグUI自体をコンポーネント化　TagCheckboxGroup.jsx */}
            <TagCheckboxGroup tags={tags} onChange={handleTagChange} />
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />

        {selectedImages.length > 0 && (
          <div>
            <div>新しく追加する画像</div>
            <div className="existingImagesContainer">
              {selectedImages.map((image, index) => (
                <div className="selectedImageContainer" key={image.id}>
                  <button
                    type="button"
                    className="removeImageButton"
                    onClick={() => handleRemoveSelectedImage(image.id)}
                  >
                    ×
                  </button>

                  <img
                    src={image.previewUrl}
                    alt={`New ${index + 1}`}
                    className="existingImagesImage"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div>画像</div>
          <div className="existingImagesContainer">
            {existingImages.map((image, index) => (
              <div className="selectedImageContainer" key={index}>
                <button
                  type="button"
                  className="removeImageButton"
                  onClick={() => handleRemoveExistingImage(index)}
                >
                  ×
                </button>

                <img
                  src={image.url}
                  alt={`Selected ${index + 1}`}
                  className="existingImagesImage"
                />

                <div className="sortButtons">
                  <button
                    type="button"
                    onClick={() => moveExistingImageUp(index)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    onClick={() => moveExistingImageDown(index)}
                    disabled={index === existingImages.length - 1}
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="postButton"
          onClick={updatePost}
          disabled={isSubmitting}
        >
          {isSubmitting ? "更新中..." : "更新する"}
        </button>
      </div>
    </div>
  );
};

export default EditPost;
