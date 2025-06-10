import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Calendar from "./pages/Calendar.jsx";
import Note from "./pages/Note.jsx";
import NoteNavigation from "./pages/NoteNavigation.jsx";
import Pomodoro from "./pages/Pomodoro.jsx";
import Signup from "./components/login_signup/Signup.jsx";
import {UseToken} from "./components/login_signup/UserHooks.jsx"
import User from "./pages/User.jsx";
import TimeMachine from "./pages/TimeMachine.jsx";
import style from "./App.module.css";
import bgDesktop from './assets/bg_desktop.png';
import bgMobile from './assets/bg_mobile.png'; // Import your mobile background image
import Testing from "./Testing/testing.jsx";

function App() {
  const {token, setToken} = UseToken();
  
  if(!token){
    return (<Signup updateToken = {setToken}/>)
  }
  return (
    <div>
      {/* Desktop background */}
      <img className={`${style.background_image} ${style.desktop_bg}`} src={bgDesktop} alt="Desktop background" />
      {/* Mobile background */}
      <img className={`${style.background_image} ${style.mobile_bg}`} src={bgMobile} alt="Mobile background" />
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/noteEditor/:id" element={<Note />} />
          <Route path="/note" element={<NoteNavigation />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/utente" element={<User />} />
          <Route path="/macchinaDelTempo" element={<TimeMachine />} />
          <Route path="/testing" element={<Testing/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;