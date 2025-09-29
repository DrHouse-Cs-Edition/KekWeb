import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Calendar from "./pages/Calendar.jsx";
import Note from "./pages/Note.jsx";
import NoteNavigation from "./pages/NoteNavigation.jsx";
import Pomodoro from "./pages/Pomodoro.jsx";
import Signup from "./components/login_signup/Signup.jsx";
import {UseToken} from "./components/login_signup/UserHooks.jsx"
import User from "./pages/User.jsx";
import style from "./App.module.css";
import bgDesktop from './assets/bg_desktop.png';
import bgMobile from './assets/bg_mobile.png';
import "./components/TimeMachine/TimeMachine.js"; // importo time-machine

function App() {
  const {token, setToken} = UseToken();
  return (
    <div>
      {/* Desktop background */}
      <img className={`${style.background_image} ${style.desktop_bg}`} src={bgDesktop} alt="Desktop background" />
      {/* Mobile background */}
      <img className={`${style.background_image} ${style.mobile_bg}`} src={bgMobile} alt="Mobile background" />
      {!token ?
          (<Signup updateToken = {setToken}/>) : 
        <>
        <Navbar />
        <div className={style.content}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendario" element={<Calendar />} />
            <Route path="/note/:id" element={<Note />} />
            <Route path="/noteNavigation" element={<NoteNavigation />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/utente" element={<User />} />
          </Routes>
        </div>
        <time-machine></time-machine>
        </>
        }
    </div>
  );
}

export default App;