import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import style from "./PomodoroDisplayer.module.css"

const PomodoroDisplayer = ()=>{
    console.log("rendering Pomodoro displayer");

    const [pomodoro, setPomodoro] = useState();

    async function latestPomodoro (){
        try {
            fetch("/api/events/latestP", {
                method: "GET",
                credentials: "include",
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    },
            })
                .then(res => res.json())
                .then(res => {
                    console.log(res);
                    return res.status == 200 ? res.pomodoro : null;
            })
        } catch (e) {
            console.log("error in reatrieving latest pomodoro scheduled \n", e);
        }
    }

    useEffect(()=>{setPomodoro(latestPomodoro())}, []);

    const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
    });
    };

    return (
        <div className={style.container}>
            <div className={style.header}>
                <h1 className={style.title}>Closest Pomodoro</h1>
                <p className={style.date}>{formatDate(new Date())}</p>
            </div>

            <div className={style.pomodoroBody}>
                <div className={style.pomodoroChart}>

                </div>
                <div className={style.pomodoroStats}>

                </div>
                <div className={style.pomodoroDate}>

                </div>
                <Link to={"/pomodoro"} state={pomodoro}>Pahim leso</Link>
            </div>

        </div>
    )
}

export default PomodoroDisplayer;