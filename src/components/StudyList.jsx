import React from "react";
import { PostList } from "./PostList";

// StudyListコンポーネントは、PostListコンポーネントを呼び出し、categoryに"study"を渡すことで、Studyカテゴリーの投稿のみを表示
const StudyList = () => {
  return <PostList category="study" title="Study一覧" />;
};

export default StudyList;
