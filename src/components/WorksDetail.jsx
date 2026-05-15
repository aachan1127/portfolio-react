import React from "react";
import { PostDetail } from "./PostDetail";

const WorksDetail = () => {
  return (
    <PostDetail
      category="works"
      title="Works詳細ページ"
      backLabel="Works一覧に戻る"
      defaultBackPath="/works"
    />
  );
};

export default WorksDetail;