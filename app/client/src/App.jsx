import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Calendario from "./pages/Calendario.jsx";
import Note from "./pages/Note.jsx";
import Note_navigation from "./pages/Note_navigation.js";
import Pomodoro from "./pages/Pomodoro.jsx";
import Utente from "./pages/Utente.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/note" element={<Note />} />
        <Route path="/note_navigation" element={<Note_navigation />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/utente" element={<Utente />} />
      </Routes>
    </>
  );
}

export default App;
