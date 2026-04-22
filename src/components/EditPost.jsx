import React, { useEffect, useState } from "react";
import "./EditPost.css";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../lib/firebase";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const EditPost = () => {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

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

      //    新しい画像をStorageにアップロードしてURLを取得する（CreatePostと同じ）
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

      // ③ Firestore更新
      await updateDoc(docRef, {
        title: title,
        postText: postText,
        // imageUrls: updatedImageUrls,
        // imagePaths: updatedImagePaths,
        // imageFileNames: updatedImageFileNames,
        imageUrls: finalImageUrls,
        imagePaths: finalImagePaths,
        imageFileNames: finalImageFileNames,
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
