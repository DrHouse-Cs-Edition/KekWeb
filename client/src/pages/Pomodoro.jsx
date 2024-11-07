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

    let [formType, updateFormType] = useState('TT');
    //const [aniState, updateAniState] = useState(0);
    let [cycles, updateCycles] = useState(2); //the number of cycles is updated AFTER said cycle is completed
    let [breakTime, updateBreakTime] = useState(0);
    let [studyTime, updateStudyTime] = useState(0);
    let [timerCode, setTimerCode] = useState(1); //0 = study, 1 = break UNLESS cycles=0
    
    const timerCycleEnd = ()=>{  
        updateCycles(cycles-1);
        console.log("removing one cycle");
    }
    
    const passTimeData = (cData, bData, sData)=>{
      updateCycles(cData);
      updateBreakTime(bData);
      updateStudyTime(sData);
    }
    
    const changeForm = ()=>{
      formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
    }

    let timerComponents = {
      1 : <SimpleTimer StudyTime={ 10 } BreakTime={ 5 } callbackFunction={timerCycleEnd}></SimpleTimer>, //timer that runs during the study cycle
      // 1 : <SimpleTimer durationA={ studyTime } durationB={ breakTime } callbackFunction={timerCycleEnd}></SimpleTimer>,
      0 : <>00:00</>

      //TODO a function that swaps based on what cycle, if any, should be running. Might need a callback for notifying the end of a cycle
    }
    //function to retrieve Time data from child components. 
    

    useEffect(()=>{
      console.log("cycles are: ", cycles, " breakTime is: ", breakTime, "studyTime is: ", studyTime);
      console.log("render anew");
      if(cycles == 0)
        setTimerCode(0);
    }, [cycles, breakTime, studyTime])

    //*formComponents is an object, and TT and Cycles it's attributes. To the TT/cycles attribute i assign a component
    //*to access a component i use a similar syntax to that of arrays. I can use a different component based on the index
    //*of the object (i'm accessing the component stored in the attribute)
    let formComponents = {
      TT : <TTform passTimeData={passTimeData}></TTform>,
      Cycles : <CyclesForm passTimeData={passTimeData}></CyclesForm>
    }

    


    //*function that changes the timer component based on if cycles ar running AND THEN what cycle just ended
    //*Must be used for a Hard reset (pressing the rest button). Soft resets (end of cycles) should be automatic
    //*given that cycles = 0 and, given that we end on a break, the next switch will be to a Study.
    

    const hardResetTimer = ()=>{
      //TODO PLACEHOLDER
    }

    return(
      <Fragment>
        {formComponents[formType]}

        <button onClick={changeForm}>Change Format</button>
        <button onClick = {()=>{
          if(!cycles || !breakTime || !studyTime){  //data is not present
          console.log("cycles are: ", cycles, " breakTime is: ", breakTime, "studyTime is: ", studyTime);
          alert("please insert timer settings");
          }
        }} >Start</button>
        {
          timerComponents[timerCode]
        }
        <div className="paperDestroyer3000">
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

