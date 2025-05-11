import { useState } from "react";

const PomodoroSideBar = ()=>{
    const pomodoroArray = [];
    const [pomodoroState, setPomodoroState] = useState(<li>nothing here</li>);

    const lezzo = [{a : "kakk"}, {a : "olol"}];

    const FetchPomodoros = ()=>{
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
                setPomodoroState(data.body.map((el)=><li key={el._id}> {el.title} </li>));  
            }
        )
        // .then( listPomodoros = lezzo.map(fruit => <li key={fruit.a} > {fruit.a} </li>))
    }


    return (
        <div>
            <button onClick={FetchPomodoros}> Ricevi pomodori</button><br></br>
            <ol>{pomodoroState}</ol>
        </div>
    )
}

export default PomodoroSideBar;