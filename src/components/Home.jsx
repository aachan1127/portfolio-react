import React from 'react'
import './Home.css';

export const Home = () => {
  return (
    <div className="homePage">
      <div className="postContents">
        <div className="postHeader">
          <h1>タイトル</h1>
        </div>
        <div className="postTextContainer">今はReactの学習中です。aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

        </div>
        <div className="nameAndDeleteButton">
          <h3>@Akane</h3>
          <button>削除</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
