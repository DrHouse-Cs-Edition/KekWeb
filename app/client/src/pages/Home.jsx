import {useState, useEffect, Fragment, useRef} from 'react';
import style from './Home.module.css';
import ListaEventiGiornalieri from '../components/listeEventi/ListaEventiGiornalieri';
import { getPersonalData } from '../components/login_signup/UserHooks';
import bgDesktop from '../assets/bg_desktop.png';


function handleNote(x){
    if(x === 0){
        return (
        <div className={style.NoteDiv}>
            It seems you haven't written any note. <br></br>

            <button> Start writing </button>
         </div>
         )
    }else{
        return <div> Note placeholder</div>
    }
}

function handlePomodoro(x){
    if(x === 0){
        return (
        <div className={style.PomodoroDiv}>
            No recent pomodoro has been found <br></br>

            <button> Create one </button>
         </div>
         )
    }else{
        return <div> Pomodoro placeholder</div>
    }
}

function handleCalendar(x){
    if(x === 0){
        return (
        <div className={style.CalendarDiv}>
            No event is pending and your calendar is free. Lucky you! <br></br>

            <button> View Calendar </button>
         </div>
         )
    }else{
        return <div> Calendar placeholder</div>
    }
}

function Home(){
    const [note, setNote] = useState(0);
    const [pomodoro, setPomodoro] = useState(0);
    const [calendar, setCalendar] = useState(0);

    
    return(
        <>
            <img className={style.background_image} src={bgDesktop} alt="Home" />
            <ListaEventiGiornalieri />
        </>
        
    )
}
export default Home;

//* IMPLEMENT DEFAULT SECTIONS FOR THE DIFFERENT CONTENTS