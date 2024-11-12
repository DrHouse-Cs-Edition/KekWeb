import React, { Fragment, useState, useEffect } from "react";
import Navbar from '../components/Navbar.jsx'
import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";
import { SimpleTimer } from "../components/pomodoroComponents/Timer.jsx"


//images section
import desk from "./images/desk.png"
import clock from "./images/clock2.png"
import "./pomodoro.css"

function Pomodoro(){
  console.log("render check Pomodoro");

  //const [aniState, updateAniState] = useState(0);
  let [cycles, updateCycles] = useState(0); //the number of cycles is updated AFTER said cycle is completed
  let [breakTime, updateBreakTime] = useState(0);
  let [studyTime, updateStudyTime] = useState(0);
  let [timerCode, setTimerCode] = useState(1); //0 = study, 1 = break UNLESS cycles=0

  //function used to recieve data from the FormSelector component regarding timer data
  

  let timerComponents = {
    1 : <SimpleTimer StudyTime={ studyTime } BreakTime={ breakTime } Cycles={cycles}></SimpleTimer>, //timer that runs during the study cycle
    // 1 : <SimpleTimer durationA={ studyTime } durationB={ breakTime } callbackFunction={timerCycleEnd}></SimpleTimer>,
    0 : <>00:00</>
  }
  //function to retrieve Time data from child components. 

  


  //*function that changes the timer component based on if cycles ar running AND THEN what cycle just ended
  //*Must be used for a Hard reset (pressing the rest button). Soft resets (end of cycles) should be automatic
  //*given that cycles = 0 and, given that we end on a break, the next switch will be to a Study.
  const hardResetTimer = ()=>{
    //TODO PLACEHOLDER
  }

  return(
    <Fragment>

      {timerComponents[timerCode]}

      <div className="paperDestroyer3000" style={{display : "block"}}> {/* //! currently set to not display, but will be used to display the timer in the future */ }
        <div id="deskDiv">
          <img id="desk" src={desk} alt="desk image"></img>
            <img src={clock} id="clockIMG" alt="clock image"></img>
          <div id="animationDiv">
          </div>
        </div>
      </div>        
      </Fragment>
  );
}
export default Pomodoro;