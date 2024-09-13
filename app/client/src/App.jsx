import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home.jsx";
import Calendario from "./components/calendario/Calendario.jsx";
import Note from "./pages/Note.jsx";
import Note_navigation from "./pages/Note_navigation.jsx";
import Pomodoro from "./pages/Pomodoro.jsx";
import Utente from "./pages/Utente.jsx";

function App() {
  return (
    <div>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/note" element={<Note />} />
          <Route path="/note_navigation" element={<Note_navigation />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/utente" element={<Utente />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
