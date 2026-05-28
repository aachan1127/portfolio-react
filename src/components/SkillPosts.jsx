import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export const SkillPosts = () => {
  const { skillId } = useParams();

  const [skill, setSkill] = useState(null);

  useEffect(() => {
    const getSkill = async () => {
      try {
        const skillDoc = await getDoc(doc(db, "skills", skillId));
        setSkill({ ...skillDoc.data(), id: skillDoc.id });
      } catch (error) {
        console.error("スキルデータの取得に失敗しました:", error);
      }
    };
    getSkill();
  }, [skillId]);

  return (
    <div>
      <h1>この技術を使った代表作品</h1>
      <p>skillId: {skillId}</p>
      <p>スキル名: {skill?.name}</p>
      <p>説明: {skill?.description}</p>
    </div>
  );
};
