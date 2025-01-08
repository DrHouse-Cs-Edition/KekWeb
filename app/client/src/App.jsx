import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home.jsx";
import Calendario from "./components/calendario/Calendario.jsx";
import Note from "./pages/Note.jsx";
import NoteNavigation from "./pages/NoteNavigation.jsx";
import Pomodoro from "./pages/Pomodoro.jsx";
import Utente from "./pages/Utente.jsx";
import Login from "./components/login_signup/Login.jsx";

function App() {
  
  const [token, setToken] = useState(0);
  
  console.log("checking for credentials");
  if(!token){
    console.log("sending login page");
    return (<Login setToken = {setToken} />)
  }

  return (
    <div>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/note/:id" element={<Note />} />
          <Route path="/noteNavigation" element={<NoteNavigation />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/utente" element={<Utente />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
