import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import "./SkillFormPage.css";

const SkillFormPage = () => {
  const { skillId, categoryId } = useParams();
  const isEditMode = Boolean(skillId);
  const isCreateMode = Boolean(categoryId);
  const [skill, setSkill] = useState(null);

  useEffect(() => {
    const getSkill = async () => {
      if (isEditMode) {
        // skillIdがある場合は編集モード
        console.log("編集モード");
        try {
          const skillDoc = await getDoc(doc(db, "skills", skillId));
          const skillData = { ...skillDoc.data(), id: skillDoc.id };
          setSkill(skillData);
        } catch (error) {
          console.error("スキルの取得に失敗しました", error);
        }
      } else if (isCreateMode) {
        // categoryIdがある場合は新規作成モード
        console.log("新規作成モード");
      } else {
        // どちらもない場合はエラー
        console.error("不正なURLです");
      }
    };
    getSkill();
  }, [skillId, categoryId, isEditMode, isCreateMode]);

  const handleSaveSkill = async () => {
    try {
      await updateDoc(doc(db, "skills", skill.id), {
        name: skill.name,
        description: skill.description,
      });
      alert("スキルが正常に更新されました");
    } catch (error) {
      console.error("スキルの更新に失敗しました", error);
    }
  };

  return (
    <div>
      <h1>{isEditMode ? "スキルを編集" : "新しいスキルを追加"}</h1>

      {isEditMode && skill && (
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
          <button type="button" onClick={handleSaveSkill}>
            保存する
          </button>
        </div>
      )}

      {isCreateMode && <p>新規作成モードです</p>}
    </div>
  );
};

export default SkillFormPage;
