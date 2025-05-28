import { useEffect, useRef, useState } from "react";
import Style from './PomodoroSideBar.module.css';

const PomodoroSideBar = ( {loadPomodoro})=>{
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
                setPomodoros(data.body.map(el => PomodoroWidgetDiv(el._id, el.title, el.studyTime, el.breakTime, el.cycles, loadPomodoro)));
            }
        )
    }
    useEffect(()=>{
        FetchPomodoros();
    },[])

    

    return (
    <div class={Style.sideBarDiv}>
        <input type="checkbox" className={Style.burger} onClick={()=>{setVisibility(visibility ^ 1)}}></input>
            <span class={Style.burgerSpan}></span>
            <span class={Style.burgerSpan}></span>  
            <span class={Style.burgerSpan}></span>
        <div style={{display : visibility ? "block" : "none"}}>
            <ol>
                {pomodoros}
            </ol>
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
// */
const PomodoroWidgetDiv = (id, title, studyT, breakT, cycles, loadPomodoro)=>{
    //vars that keeps the degress for the chart

    let sum = studyT + breakT;
    let studyP = (studyT / sum) *360;
    let breakP = (breakT / sum) *360;

    return ( 
        <li key={id}> 
        <div className={Style.barItem}>
            <div className={Style.piechart} style={{backgroundImage: `conic-gradient(green 0deg ${breakP}deg, red ${breakP}deg ${studyP}deg)`}}></div>
            <div className={Style.data}>
                <ul>
                <li><h2 style={{maxWidth : "8em", wordWrap: "break-word"}}>{title}</h2></li>
                <li>study time: {studyT} </li>
                <li>break time: {breakT} </li>
                <li>cycles: {cycles}</li>
                </ul>
            </div>
            <div className={Style.buttons}>
                <button className={Style.openB} onClick={()=>loadPomodoro(id, title, studyT, breakT, cycles)}>Open</button>
                <button className={Style.modifyB} onClick={()=>{console.log("renaming pomdoro: ", title)}}>Rename</button>
                <button className={Style.deleteB} onClick={()=>{console.log("opening deleting: ", title)}}>Delete</button>
            </div>
            <br></br>
        </div></li>
    )
}