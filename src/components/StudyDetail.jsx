import React from "react";
import { PostDetail } from "./PostDetail";

const StudyDetail = () => {
  return (
    <PostDetail
      category="study"
      title="Study詳細ページ"
      backLabel="Study一覧に戻る"
      defaultBackPath="/study"
    />
  );
};

export default StudyDetail;