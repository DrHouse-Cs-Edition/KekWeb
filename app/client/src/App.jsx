import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home.jsx";
import Calendar from "./pages/Calendar.jsx";
import Note from "./pages/Note.jsx";
import NoteNavigation from "./pages/NoteNavigation.jsx";
import Pomodoro from "./pages/Pomodoro.jsx";
import Signup from "./components/login_signup/Signup.jsx";
import {UseToken} from "./components/login_signup/UserHooks.jsx"
import User from "./pages/User.jsx";

function App() {
  
  const {token, setToken} = UseToken();
  
  if(!token){
    return (<Signup updateToken = {setToken}/>)
  }

  return (
    <div>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/note/:id" element={<Note />} />
          <Route path="/noteNavigation" element={<NoteNavigation />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;