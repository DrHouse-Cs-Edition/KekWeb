import { useEffect, useRef, useState } from "react";
import style from './PomodoroSideBar.module.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

//TODO cambiare da una sidebar ad un menù verticale

const PomodoroSideBar = ( {loadPomodoro,renamePomodoro, deleteCallback})=>{
    const [pomodoroData, setPomodoroData] = useState([]);

    function FetchPomodoros(){
        console.log("lezzo gaming");
        fetch("api/Pomodoro/getP", {
            method:"GET",
            mode:"cors",
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
        .then(res => res.json())
        .then((data) =>{
            console.log(data.body)
            setPomodoroData(data.body)
                // data.body.map((el)=>{pomodoroArray.push(el); console.log(el.title)});
                // setPomodoros(data.body.map(el => (<PomodoroWidgetDiv id = {el._id} title={el.title} studyTime={el.studyT} breakT={el.breakTime} 
                //     cycle={el.cycles} loadPomodoro={loadPomodoro} deleteCallback={deleteCallback}/>)));
            }
        ).catch(e =>{
            console.log("error fetching pomodoros for pomodoro page: ", e)
        })
    }
    useEffect(()=>{
        FetchPomodoros();
    },[])
    
    return (
        <div class={style.sideBarDiv}>
            <div className={style.pomodoroList}>  {/*Display is columns */}
                    {pomodoroData.map((el, index)=>
                        <PomodoroWidgetDiv
                        key={el._id} // Add a unique key
                        id={el._id}
                        title={el.title}
                        studyT={el.studyTime}
                        breakT={el.breakTime}
                        cycles={el.cycles}
                        loadPomodoro={loadPomodoro}
                        deleteCallback={deleteCallback}
                        ></PomodoroWidgetDiv>
                    )}
            </div>
        </div>
    )
    
}



//* Function that presents the pomodoro widget 
//* it requires the pomodoro information to present the widget
//* info is:
//* - id
//* - title
//* - study phase duration
//* - break phase duration
//* - rounds
//* - loadPomodoro function to load the pomodoro
//* - deletePomodoro function to delete the pomodoro
//* - editPomodoro function to edit the pomodoro
// */
const PomodoroWidgetDiv = ({id, title, studyT, breakT, cycles, loadPomodoro, deleteCallback})=>{
    //vars that keeps the degress for the chart
    const [display, setDisplay] = useState(1);
    let sum = studyT + breakT;
    
    const deletePomodoro = ()=>
    {
        fetch(`/api/Pomodoro/deleteP/` + id,{
            method: 'DELETE',
            mode: "cors",
            headers: {
                'Content-Type': 'application/json',
            },
            })
            .then(response =>
            {
                if(response.ok){
                deleteCallback();
            }
            else{
            alert("Errore nella cancellazione del pomodoro");
            }})
            .catch(error =>{
                alert("Errore nella cancellazione del pomodoro");
            }
        );
    }

    ChartJS.register(ArcElement, Tooltip, Legend);

    const data = {
        labels: ['Study', 'Relax'],
        datasets: [
        {
            data: [studyT, breakT],
            backgroundColor: ['#4254fb', '#ffb422'],
            // borderColor: ['white', 'white'],
            borderWidth: 0,
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

    // style={{display: display ? "grid" : "none"}}
    return (
        <div className={style.barItem} style={{display: display ? "" : "none"} }>
            <div className={style.itemTitle}>
                <h3 style={{wordWrap: "break-word", maxWidth : "15ch"}}>
                    {title}
                </h3>
            </div>
            <div className={style.pomodoroChart}  onClick={()=>loadPomodoro(id, title, studyT, breakT, cycles)}>  
                {/* <button  className={style.pomodoroOpen} onClick={()=>loadPomodoro(id, title, studyT, breakT, cycles)}> */}
                    <Pie data={data} options={options} />
            </div>
            <div className={style.buttons}>
                {/* <button className={`${style.openB} ${style.button}`} onClick={()=>loadPomodoro(id, title, studyT, breakT, cycles)}>Open</button> */}
                <button className={`${style.deleteB} ${style.button}`} onClick={()=>{deletePomodoro(); setDisplay(0)}}>Cancella</button>
            </div>
        </div>
    )
}

export default PomodoroSideBar;