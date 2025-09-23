import { useEffect, useRef, useState } from "react";
import style from './PomodoroSideBar.module.css';
import { PieChart } from "@mui/x-charts";

//TODO cambiare da una sidebar ad un menù verticale

const PomodoroSideBar = ( {loadPomodoro,renamePomodoro, deleteCallback})=>{
    const pomodoroArray = [];
    const [pomodoros, setPomodoros] = useState("");
    const [visibility, setVisibility] = useState(0);

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
        .then(res => res.json()
        ).then(
            (data) =>{
                data.body.map((el)=>{pomodoroArray.push(el); console.log(el.title)});
                setPomodoros(data.body.map(el => PomodoroWidgetDiv(el._id, el.title, el.studyTime, el.breakTime, el.cycles, loadPomodoro, deleteCallback)));
            }
        )
    }
    useEffect(()=>{
        FetchPomodoros();
    },[])

    

    return (
    <div class={style.sideBarDiv}>
        <div className={style.pomodoroList}>  {/*Display is columns */}
                {pomodoros}
        </div>
    </div>
    )
}

export default PomodoroSideBar;

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
const PomodoroWidgetDiv = (id, title, studyT, breakT, cycles, loadPomodoro, deleteCallback)=>{
    //vars that keeps the degress for the chart
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
            alert("Error deleting the Pomodoro");
            }})
            .catch(error =>{
                alert("Error deleting the Pomodoro");
            }
        );
    }

    return (
        <div className={style.barItem}>
            <div className={style.itemTitle}>
                <h3 style={{wordWrap: "break-word", maxWidth : "15ch"}}>
                    {title}
                </h3>
            </div>
            <div className={style.pomodoroChart}>
                
                <PieChart
                    className={style.pomodoroPie}
                    series={[{
                        data : [
                            {id : 0, value : studyT, label : "Study Time"},
                            {id : 1, value : breakT, label : "Break Time"}
                        ],
                    },
                ]}
                ></PieChart>
            </div>
            <div className={style.buttons}>
                <button className={`${style.openB} ${style.button}`} onClick={()=>loadPomodoro(id, title, studyT, breakT, cycles)}>Open</button>
                <button className={`${style.deleteB} ${style.button}`} onClick={()=>deletePomodoro()}>Delete</button>
            </div>
            <br></br>
        </div>
    )
}