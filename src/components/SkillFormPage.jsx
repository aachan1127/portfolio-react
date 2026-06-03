import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "../lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import "./SkillFormPage.css";

const SkillFormPage = () => {
  const { skillId, categoryId } = useParams();
  const isEditMode = Boolean(skillId);
  const isCreateMode = Boolean(categoryId);
  const [skill, setSkill] = useState(null);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalDisplayOrder, setOriginalDisplayOrder] = useState(null);
  const [maxDisplayOrder, setMaxDisplayOrder] = useState(1);

  useEffect(() => {
    const getSkill = async () => {
      if (isEditMode) {
        // skillIdがある場合は編集モード
        try {
          const skillDoc = await getDoc(doc(db, "skills", skillId));
          const skillData = { ...skillDoc.data(), id: skillDoc.id };
          setSkill(skillData);
          setOriginalDisplayOrder(skillData.displayOrder);

          // 同じカテゴリーのスキルの最大の表示順を取得して、それ以上は入力できないようにする
          const skillsQuery = query(
            collection(db, "skills"),
            where("categoryId", "==", skillData.categoryId),
          );

          const skillsSnapshot = await getDocs(skillsQuery);

          const displayOrders = skillsSnapshot.docs.map((skillDoc) => {
            return skillDoc.data().displayOrder;
          });

          const maxOrder =
            displayOrders.length > 0 ? Math.max(...displayOrders) : 1;

          setMaxDisplayOrder(maxOrder);
        } catch (error) {
          console.error("スキルの取得に失敗しました", error);
        }
      } else if (isCreateMode) {
        // categoryIdがある場合は新規作成モード
        // 同じカテゴリーのスキルの中で最大の表示順を取得して、新しいスキルの表示順を設定
        const skillsQuery = query(
          collection(db, "skills"),
          where("categoryId", "==", categoryId),
        );

        const skillsSnapshot = await getDocs(skillsQuery);

        const displayOrders = skillsSnapshot.docs.map((skillDoc) => {
          return skillDoc.data().displayOrder;
        });

        const maxOrder =
          displayOrders.length > 0 ? Math.max(...displayOrders) : 0;

        setMaxDisplayOrder(maxOrder + 1);
        setSkill({
          name: "",
          description: "",
          categoryId: categoryId,
          iconUrl: "",
          iconPath: "",
          displayOrder: maxOrder + 1,
          isVisible: true,
          relatedPostIds: [],
        });
      } else {
        // どちらもない場合はエラー
        console.error("不正なURLです");
      }
    };
    getSkill();
  }, [skillId, categoryId, isEditMode, isCreateMode]);

  const handleSaveSkill = async () => {
    // 入力値のバリデーション
    if (!skill.name.trim()) {
      alert("名前を入力してください");
      return;
    }

    if (!skill.description.trim()) {
      alert("説明文を入力してください");
      return;
    }

    if (skill.displayOrder < 1) {
      alert("表示順は1以上の数字を入力してください");
      return;
    }

    if (skill.displayOrder > maxDisplayOrder) {
      alert(`表示順は${maxDisplayOrder}以下の数字を入力してください`);
      return;
    }

    // 表示順が重複しないように、他のスキルの表示順を調整
    if (isEditMode) {
      try {
        const skillsQuery = query(
          collection(db, "skills"),
          where("categoryId", "==", skill.categoryId),
        );

        const skillsSnapshot = await getDocs(skillsQuery);

        // 表示順が変更された場合、他のスキルの表示順を調整（上へ移動）
        if (skill.displayOrder < originalDisplayOrder) {
          const updatePromises = skillsSnapshot.docs.map((skillDoc) => {
            const existingSkill = skillDoc.data();

            if (
              existingSkill.displayOrder >= skill.displayOrder &&
              existingSkill.displayOrder < originalDisplayOrder
            ) {
              return updateDoc(doc(db, "skills", skillDoc.id), {
                displayOrder: existingSkill.displayOrder + 1,
              });
            }
            return null;
          });
          const filteredUpdatePromises = updatePromises.filter(Boolean);
          await Promise.all(filteredUpdatePromises);
          console.log("上へ移動");
        }

        // 表示順が変更された場合、他のスキルの表示順を調整（下へ移動）
        if (skill.displayOrder > originalDisplayOrder) {
          const updatePromises = skillsSnapshot.docs.map((skillDoc) => {
            const existingSkill = skillDoc.data();

            if (
              existingSkill.displayOrder > originalDisplayOrder &&
              existingSkill.displayOrder <= skill.displayOrder
            ) {
              return updateDoc(doc(db, "skills", skillDoc.id), {
                displayOrder: existingSkill.displayOrder - 1,
              });
            }

            return null;
          });

          const filteredUpdatePromises = updatePromises.filter(Boolean);
          await Promise.all(filteredUpdatePromises);

          console.log("下へ移動");
        }

        await updateDoc(doc(db, "skills", skill.id), {
          name: skill.name,
          description: skill.description,
          iconUrl: skill.iconUrl,
          iconPath: skill.iconPath,
          displayOrder: skill.displayOrder,
        });
        alert("スキルが正常に更新されました");
        navigate("/");
      } catch (error) {
        console.error("スキルの更新に失敗しました", error);
      }
    }
    if (isCreateMode) {
      try {
        const skillsQuery = query(
          collection(db, "skills"),
          where("categoryId", "==", skill.categoryId),
        );

        const skillsSnapshot = await getDocs(skillsQuery);

        console.log(
          skillsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );

        const updatePromises = skillsSnapshot.docs.map((skillDoc) => {
          const existingSkill = skillDoc.data();

          if (existingSkill.displayOrder >= skill.displayOrder) {
            return updateDoc(doc(db, "skills", skillDoc.id), {
              displayOrder: existingSkill.displayOrder + 1,
            });
          }

          return null;
        });
        const filteredUpdatePromises = updatePromises.filter(Boolean);
        await Promise.all(filteredUpdatePromises);

        const newSkillRef = await addDoc(collection(db, "skills"), {
          name: skill.name,
          description: skill.description,
          categoryId: skill.categoryId,
          iconUrl: "",
          iconPath: "",
          displayOrder: skill.displayOrder,
          isVisible: skill.isVisible,
          relatedPostIds: skill.relatedPostIds,
        });
        console.log("新しく作成されたスキルID:", newSkillRef.id);

        if (selectedFile) {
          const imagePath = `skillIcons/${newSkillRef.id}/${selectedFile.name}`;
          const imageRef = ref(storage, imagePath);

          await uploadBytes(imageRef, selectedFile);

          const downloadUrl = await getDownloadURL(imageRef);

          await updateDoc(doc(db, "skills", newSkillRef.id), {
            iconUrl: downloadUrl,
            iconPath: imagePath,
          });
        }

        alert("スキルが正常に作成されました");
        navigate("/");
      } catch (error) {
        console.error("スキルの作成に失敗しました", error);
      }
    }
  };

  // 削除処理
  const handleDeleteSkill = async () => {
    const isConfirmed = window.confirm("このスキルを削除しますか？");

    if (!isConfirmed) {
      return;
    }

    try {
      const skillsQuery = query(
        collection(db, "skills"),
        where("categoryId", "==", skill.categoryId),
      );

      const skillsSnapshot = await getDocs(skillsQuery);

      const updatePromises = skillsSnapshot.docs.map((skillDoc) => {
        const existingSkill = skillDoc.data();

        if (existingSkill.displayOrder > skill.displayOrder) {
          return updateDoc(doc(db, "skills", skillDoc.id), {
            displayOrder: existingSkill.displayOrder - 1,
          });
        }

        return null;
      });

      const filteredUpdatePromises = updatePromises.filter(Boolean);
      await Promise.all(filteredUpdatePromises);

      if (skill.iconPath) {
        const iconRef = ref(storage, skill.iconPath);
        await deleteObject(iconRef);
      }

      await deleteDoc(doc(db, "skills", skill.id));

      alert("スキルを削除しました");
      navigate("/");
    } catch (error) {
      console.error("スキルの削除に失敗しました", error);
      alert("スキルの削除に失敗しました");
    }
  };

  const handleUploadSkillIcon = async (file) => {
    if (!file || !skill) return;

    try {
      const oldIconPath = skill.iconPath;

      const imagePath = `skillIcons/${skill.id}/${file.name}`;
      const imageRef = ref(storage, imagePath);

      await uploadBytes(imageRef, file);

      const downloadUrl = await getDownloadURL(imageRef);

      setSkill({
        ...skill,
        iconUrl: downloadUrl,
        iconPath: imagePath,
      });

      if (oldIconPath) {
        const oldImageRef = ref(storage, oldIconPath);
        await deleteObject(oldImageRef);
      }
    } catch (error) {
      console.error("アイコン画像のアップロードに失敗しました", error);
      alert("アイコン画像のアップロードに失敗しました");
    }
  };

  return (
    <div>
      <h1>{isEditMode ? "スキルを編集" : "新しいスキルを追加"}</h1>
      <div className="skillIconPreview">
        {skill?.iconUrl && (
          <img src={skill.iconUrl} alt={`${skill.name}のアイコン`} />
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];

          setSelectedFile(file);

          if (isEditMode) {
            handleUploadSkillIcon(file);
          }
        }}
      />
      {skill && (
        <div>
          <p>
            <input
              type="text"
              value={skill.name}
              onChange={(e) => setSkill({ ...skill, name: e.target.value })}
            />
          </p>
          <p>
            <textarea
              value={skill.description}
              onChange={(e) =>
                setSkill({ ...skill, description: e.target.value })
              }
            />
          </p>
          <div>
            <input
              type="number"
              min="1"
              max={maxDisplayOrder}
              value={skill.displayOrder}
              onChange={(e) =>
                setSkill({
                  ...skill,
                  displayOrder: Number(e.target.value),
                })
              }
            />
          </div>
          <button type="button" onClick={handleSaveSkill}>
            保存する
          </button>

          {isEditMode && (
            <button type="button" onClick={handleDeleteSkill}>
              このスキルを削除する
            </button>
          )}
        </div>
      )}
      {isCreateMode && <p>新規作成モードです</p>}
    </div>
  );
};

export default SkillFormPage;
