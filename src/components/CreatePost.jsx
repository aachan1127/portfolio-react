import React, {useEffect, useState} from 'react';
import './CreatePost.css';
import { collection } from 'firebase/firestore'
import { auth } from '../lib/firebase'
import  { addDoc } from 'firebase/firestore'
import { db } from "../lib/firebase";
import { useNavigate } from 'react-router-dom';
  
export const CreatePost = ({ isAuth }) => {
  const [title, setTitle] = useState('');
  const [postText, setPostText] = useState('');

  const navigate = useNavigate();

  const createPost = async () => {
    await addDoc(collection(db, "posts"), {
      title: title,
      postText: postText,
      author : { 
        name: auth.currentUser.displayName,
        id: auth.currentUser.uid
      }
    });

    navigate("/");
  };

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="createPostPage">
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
        <button className="postButton" onClick={createPost}>投稿する</button>
      </div>
    </div>
  );
}

export default CreatePost;
