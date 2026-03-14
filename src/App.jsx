import { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import CreatePost from "./components/CreatePost";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Navbar from "./components/Navbar";

function App() {
  const [isAuth, setAuth] = useState(false);

  // ページをリロードしてもログイン状態を保持するための処理↓
  // function App() {
  // const [isAuth, setAuth] = useState(
  //   localStorage.getItem("isAuth") === "true"
  // );

  return (
    <Router>
      <Navbar isAuth={isAuth}></Navbar>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/createpost" element={<CreatePost />}></Route>
        <Route path="/login" element={<Login setIsAuth={setAuth} />}></Route>
        <Route path="/logout" element={<Logout />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
