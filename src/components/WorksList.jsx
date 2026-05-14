import React from "react";
import { PostList } from "./PostList";

// WorksListコンポーネントは、PostListコンポーネントを呼び出し、categoryに"works"を渡すことで、Worksカテゴリーの投稿のみを表示
const WorksList = () => {
  return <PostList category="works" title="Works一覧" />;
};

export default WorksList;
