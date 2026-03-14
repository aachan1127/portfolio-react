import { signInWithPopup, signOut } from "firebase/auth";
import React from "react";
import { auth, provider } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

const Logout = ({ setIsAuth }) => {
  const navigate = useNavigate();

  const logout = () => {
    // Googleログアウトの処理
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      navigate("/login");
      })
      .catch((error) => {
        console.error("ログインエラー:", error.code, error.message);
      });
  };

  return (
    <div>
      <p>ログアウトする</p>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
};

export default Logout;
