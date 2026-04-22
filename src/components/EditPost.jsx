import React, { useEffect, useRef, useState } from "react";
import "./EditPost.css";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { storage } from "../lib/firebase";
import { ref, deleteObject } from "firebase/storage";
import { db } from "../lib/firebase";

const EditPost = () => {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);

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

      //  ② Storage から削除された画像を消す
      if (deletedImages.length > 0) {
        for (const image of deletedImages) {
          const imageRef = ref(storage, image.path);
          await deleteObject(imageRef);
        }
      }

      const docRef = doc(db, "posts", id);

      // ③ Firestore更新
      await updateDoc(docRef, {
        title: title,
        postText: postText,
        imageUrls: updatedImageUrls,
        imagePaths: updatedImagePaths,
        imageFileNames: updatedImageFileNames,
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
    <div className="editPostPage">
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
