import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home.jsx";
import Calendar from "./pages/Calendar.jsx";
import Note from "./pages/Note.jsx";
import NoteNavigation from "./pages/NoteNavigation.jsx";
import Pomodoro from "./pages/Pomodoro.jsx";
import Utente from "./pages/Utente.jsx";

function App() {
  return (
    <div>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
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
