import { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import CreatePost from "./components/CreatePost";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Navbar from "./components/Navbar";
import EditPost from "./components/EditPost";
import StudyList from "./components/StudyList";
import StudyDetail from "./components/StudyDetail";
import WorksList from "./components/WorksList";
import WorksDetail from "./components/WorksDetail";
import AllPosts from "./components/AllPosts";
import { SkillPosts } from "./components/SkillPosts";
import  SkillFormPage  from "./components/SkillFormPage";


function App() {
  // ↓ リロードしてもログイン状態を管理するためのstate
  const [isAuth, setAuth] = useState(localStorage.getItem("isAuth") === "true");

  return (
    <Router>
      <Navbar isAuth={isAuth}></Navbar>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route
          path="/createpost"
          element={<CreatePost isAuth={isAuth} />}
        ></Route>
        <Route path="/login" element={<Login setIsAuth={setAuth} />}></Route>
        <Route path="/logout" element={<Logout setIsAuth={setAuth} />}></Route>
        <Route path="/editpost/:id" element={<EditPost />} />
        <Route path="/study" element={<StudyList />} />
        <Route path="/works" element={<WorksList />} />
        <Route path="/posts" element={<AllPosts />} />
        <Route path="/study/:id" element={<StudyDetail />} />
        <Route path="/works/:id" element={<WorksDetail />} />
        <Route path="/skills/:skillId" element={<SkillPosts />} />
        <Route path="/skills/:skillId/edit" element={<SkillFormPage />} />
        <Route
          path="/skill-categories/:categoryId/skills/new"
          element={<SkillFormPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
