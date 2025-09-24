import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import style from "./PomodoroDisplayer.module.css"
import { PieChart } from "@mui/x-charts";

const PomodoroDisplayer = ()=>{
    console.log("rendering Pomodoro displayer");

    const [pomodoroEvent, setPomodoroEvent] = useState();           //ultimo pomodoro trovato
    //* Forma dell'oggetto che si deve ricevere
    // const latestPomodoro2 ={
    //     title: foundP.title,
    //     Pid:  foundP._id,
    //     Eid: foundEV._id,
    //     studyT: foundP.studyTime,
    //     breakT: foundP.breakTime,
    //     cycles: foundP.cycles,
    //     date : foundEV.start
    // }

    function latestPomodoro (){
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
                    if( res.success == true){
                        setPomodoroEvent(res.pomodoro);
                    }else{
                        return null;
                    }
            })
        } catch (e) {
            console.log("error in reatrieving latest pomodoro scheduled \n", e);
        }
    }

    useEffect(()=>{latestPomodoro()}, []);

    const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
    })};

    if ( pomodoroEvent != null){
    return (
        <div className={style.container}>
            <div className={style.header}>
                <h1 className={style.title}>Pomodoro più urgente: <u>{pomodoroEvent?.title}</u></h1>
                <p className={style.date}>{formatDate(new Date(pomodoroEvent?.date))}</p>
            </div>

            <div className={style.pomodoroBody}>
                <div className={style.pomodoroChart}>
                    <PieChart
                        className={style.pomodoroPie}
                        series={[{
                            data : [
                                {id : 0, value : pomodoroEvent?.studyT, label : "Durata studio"},
                                {id : 1, value : pomodoroEvent?.breakT, label : "Durata pausa"}
                            ],
                        },
                    ]}
                    ></PieChart>
                </div>
                <div className={style.pomodoroStats}>
                    <span>Studio: {pomodoroEvent?.studyT} minuti </span>
                    <span>Pausa: {pomodoroEvent?.breakT} minuti</span>
                    <span>Cicli: {pomodoroEvent?.cycles}</span>
                </div>
                <Link  to={"/pomodoro"}
                    state={{
                        _id: pomodoroEvent?.Pid,
                        title: pomodoroEvent?.title,
                        studyTime: pomodoroEvent?.studyT,
                        breakTime: pomodoroEvent?.breakT,
                        cycles: pomodoroEvent?.cycles
                    }}
                    className={style.linkButton} // Apply the new button style
                >
                    Inizia il Pomodoro
                </Link>
            </div>
        </div>
    )}
    else{
        return <NoPomodoro></NoPomodoro>
    }
}

//*DEFAULT COMPONENT FOR CASE OF NO POMODORO TO BE FOUND (either error or none has been created and set)
const NoPomodoro = ()=>{
    return (
        <div className={style.container}>
            <div className={style.header}>
                <h1 className={style.title}>Nessun pomodoro pendente</h1>
            </div>

            <div className={style.pomodoroBody}>
                <h2>
                    Non hai nessun Pomodoro fissato per una data. <br></br>
                    Vai alla pagina pomodoro per crearne uno, e poi dal calendario puoi aggiungerlo.
                </h2>
                <Link to={"/pomodoro"}>Pagina Pomodoro</Link>
            </div>
        </div>
    )
}

export default PomodoroDisplayer;