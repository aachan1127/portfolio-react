import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, provider } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAuth }) => {
  const navigate = useNavigate();

  const loginWithGoogle = () => {
    // Googleログインの処理
    signInWithPopup(auth, provider).then((result) => {
      localStorage.setItem("isAuth", "true");
      setIsAuth(true);
      navigate("/");
    })
      .catch((error) => {
        console.error("ログインエラー:", error.code, error.message);
      });
  };


  return (
    <div>
      <p>ログインして始める</p>
      <button onClick={loginWithGoogle}>Googleでログイン</button>
    </div>
  );
};

export default Login;
