import React from "react";
import { PostList } from "./PostList";

// AllPostsコンポーネントは、PostListコンポーネントを呼び出し、categoryに"all"を渡すことで、全ての投稿を表示
const AllPosts = () => {
  return <PostList category="all" title="全投稿一覧" detailPath="" />;
};

export default AllPosts;
