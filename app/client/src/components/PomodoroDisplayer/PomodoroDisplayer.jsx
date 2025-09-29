import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import style from "./PomodoroDisplayer.module.css"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

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

    ChartJS.register(ArcElement, Tooltip, Legend);

    const data = {
        labels: ['Durata Studio', 'Durata Pausa'],
        datasets: [
        {
            data: [pomodoroEvent?.studyT, pomodoroEvent?.breakT],
            backgroundColor: ['#4254fb', '#ffb422'],
            borderColor: ['white', 'white'],
            borderWidth: 1,
        },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // occupa lo spazio disponibile
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white', // legenda bianca
                },
            },
        },
        tooltip: {
            enabled: true,
        },
        datalabels: {
            color: 'white',
            formatter: (value, context) => {
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                return ((value / total) * 100).toFixed(0) + '%';
            },
            font: {
                weight: 'bold',
                size: 14,
            },
        },
    };
    

    if ( pomodoroEvent != null){
    return (
        <div className={style.container}>
            <div className={style.header}>
                <h1 className={style.title}>Pomodoro più urgente: <u>{pomodoroEvent?.title}</u></h1>
                <p className={style.date}>{formatDate(new Date(pomodoroEvent?.date))}</p>
            </div>

            <div className={style.pomodoroBody}>
                <div className={style.pomodoroChart}>
                    <Pie data={data} options={options} />
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