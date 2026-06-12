import { useEffect, useRef, useState } from "react";
import "./PostForm.css";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, storage } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TagCheckboxGroup } from "./TagCheckboxGroup";

export const CreatePost = ({ isAuth }) => {
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const selectedImagesRef = useRef([]);
  const navigate = useNavigate();
  const postsCollectionRef = collection(db, "posts");
  // 未選択でもStudyとして保存できるようにするため、初期値は"study"にしておく
  const [category, setCategory] = useState("study");
  const [displayType, setDisplayType] = useState("list");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  // 画像選択の処理
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

    // 同じファイルをもう一度選び直せるように input を空にする
    e.target.value = "";
  };

  const handleRemoveImage = (id) => {
    setSelectedImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((image) => image.id !== id);
    });
  };

  const moveImageUp = (index) => {
    if (index === 0) return;

    setSelectedImages((prev) => {
      const newImages = [...prev];
      [newImages[index - 1], newImages[index]] = [
        newImages[index],
        newImages[index - 1],
      ];
      return newImages;
    });
  };

  const moveImageDown = (index) => {
    setSelectedImages((prev) => {
      if (index === prev.length - 1) return prev;
      const newImages = [...prev];
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      return newImages;
    });
  };

  // タグの処理の関数
  const handleTagChange = (e) => {
    const tag = e.target.value;
    if (e.target.checked) {
      setTags((prev) => [...prev, tag]);
    } else {
      setTags((prev) => prev.filter((item) => item !== tag));
    }
  };

  const createPost = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してね");
      return;
    }

    if (!postText.trim()) {
      alert("説明を入力してね");
      return;
    }

    if (selectedImages.length === 0) {
      alert("画像を1枚以上選択してね");
      return;
    }

    for (const image of selectedImages) {
      const file = image.file;
      if (!file.type.startsWith("image/")) {
        alert("画像ファイルだけ選択してね");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" は5MBを超えているよ`);
        return;
      }
    }

    if (!auth.currentUser) {
      alert("ログイン情報が見つかりません");
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      const uid = auth.currentUser.uid;

      const imageUrls = [];
      const imagePaths = [];

      for (const image of selectedImages) {
        const file = image.file;
        // ファイル名が重複しにくいようにする
        const fileName = `${Date.now()}_${file.name}`;

        // Storage の保存先
        const imageRef = ref(storage, `postImages/${uid}/${fileName}`);

        // 画像を Storage にアップロード
        await uploadBytes(imageRef, file);

        // 表示用URLを取得
        const imageUrl = await getDownloadURL(imageRef);

        imageUrls.push(imageUrl);
        imagePaths.push(imageRef.fullPath);
      }

      // メイン・サブ・その他の表示順をFirestore用の値として保存するための関数
      const getDisplayRank = () => {
        if (displayType === "list") {
          return 7;
        }
        return Number(displayType);
      };

      const displayRank = getDisplayRank();

      if (displayRank >= 1 && displayRank <= 6) {
        const data = await getDocs(postsCollectionRef);
        const rankField =
          category === "study" ? "studyDisplayRank" : "worksDisplayRank";
        const currentPost = data.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .find(
            (post) =>
              post.category === category && post[rankField] === displayRank,
          );
        if (currentPost) {
          const displayLabelMap = {
            1: "メイン",
            2: "サブ",
            3: "その他1番目",
            4: "その他2番目"
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

      // Firestore に投稿データを保存
      await addDoc(postsCollectionRef, {
        title: title,
        postText: postText,
        imageUrls: imageUrls,
        // .trim()で前後の空白を自動で削除する
        videoUrl: videoUrl.trim(),
        imagePaths: imagePaths,
        thumbnailUrl: imageUrls[0],
        imageFileNames: selectedImages.map((image) => image.fileName),
        author: {
          name: auth.currentUser.displayName,
          id: uid,
        },
        category: category,
        tags: tags,
        // 一覧のみに表示させるのはnull ではなく 7 に統一
        studyDisplayRank: category === "study" ? displayRank : 7,
        worksDisplayRank: category === "works" ? displayRank : 7,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      navigate("/");
    } catch (error) {
      console.error("投稿エラー code:", error.code);
      console.error("投稿エラー message:", error.message);
      console.error("投稿エラー本体:", error);
      alert(`投稿に失敗しました: ${error.code}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

  return (
    <div className="postFormPage">
      <div className="postContainer">
        <h1>記事を投稿する</h1>

        <div className="inputPost">
          <div>タイトル</div>
          <input
            type="text"
            placeholder="タイトルを記入"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="inputPost">
          <div>説明</div>
          <textarea
            placeholder="説明を記入"
            onChange={(e) => setPostText(e.target.value)}
          ></textarea>
        </div>

        <div className="inputPost">
          <div>動画URL</div>
          <input
            type="text"
            placeholder="動画URLを記入"
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <div className="inputPost">
          <div>カテゴリ</div>
          <select
            value={category}
            // selectで選ばれた値をcategoryのstateにセットする
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="study">Study</option>
            <option value="works">Works</option>
          </select>
        </div>

        <div className="inputPost">
          <div>表示順</div>
          <select
            value={displayType}
            onChange={(e) => setDisplayType(e.target.value)}
          >
            <option value="list">一覧のみ</option>
            <option value="1">メイン</option>
            <option value="2">サブ</option>

            {/* カテゴリでstudyを選んだ時だけ「その他」を選択可能にする */}
            {category === "study" && (
              <>
                <option value="3">その他1番目</option>
                <option value="4">その他2番目</option>
              </>
            )}
          </select>
        </div>

        <div className="inputPost">
          <div>使用技術タグ</div>

          <div className="tagCheckboxGroup">
            {/* 重複しているタグUI自体をコンポーネント化TagCheckboxGroup.jsx */}
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
          <div className="previewSection">
            <p className="previewTitle">選択中の画像</p>
            <div className="previewGrid">
              {selectedImages.map((image, index) => (
                <div className="previewItem" key={image.id}>
                  <div className="previewImageWrap">
                    <button
                      type="button"
                      className="removePreviewButton"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      ×
                    </button>

                    <img
                      src={image.previewUrl}
                      alt={image.fileName}
                      className="previewImage"
                    />
                  </div>

                  <p className="previewOrder">画像 {index + 1}</p>
                  <p className="previewFileName">{image.fileName}</p>

                  <div className="previewActions">
                    <button
                      type="button"
                      className="sortButton"
                      onClick={() => moveImageUp(index)}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="sortButton"
                      onClick={() => moveImageDown(index)}
                      disabled={index === selectedImages.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ボタンを送信中は押せないようにする（連打防止）*/}
        <button
          className="postButton"
          onClick={createPost}
          disabled={isSubmitting}
        >
          {isSubmitting ? "投稿中..." : "投稿する"}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
