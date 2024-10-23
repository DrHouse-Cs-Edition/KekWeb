import React, { Fragment, useState, useEffect } from "react";
import Navbar from '../components/Navbar.jsx'
import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";
import Timer from "../components/pomodoroComponents/Timer.jsx"

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
    let [timerCode, setTimerCode] = useState(0); //0 = study, 1 = break UNLESS cycles=0
    
    
    const switchTimer = ()=>{
      //cases: IF cycles > 0 
      //0 = study, 1 = break
      //ELSE default
      setTimerCode(Math.abs(1-timerCode));
      console.log("switching to timer n ", Math.abs(1-timerCode) );
      if(timerCode == 0)  //having switched back to study cycle,  a complete cycle has ended
        {cycles --;
          console.log("-1 cycle");
        }
      if(cycles <= 0 ){
        console.log("cycles ended");
        setTimerCode(2);
      }    //in case i have no more cycles to run, i reset to the default component
        
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
      0 : <Timer duration = {10} notifyEnd = {switchTimer}></Timer>, //timer that runs during the study cycle
      1 : <Timer duration = {5} notifyEnd = {switchTimer}></Timer>, //timer that runs during the break cycle
      2 : <>00:00</>

      //TODO a function that swaps based on what cycle, if any, should be running. Might need a callback for notifying the end of a cycle
    }
    //function to retrieve Time data from child components. 
    

    useEffect(()=>{
      console.log("cycles are: ", cycles, " breakTime is: ", breakTime, "studyTime is: ", studyTime);
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

        <div className="paperDestroyer3000">
          <div id="deskDiv">
            <img id="desk" src={desk} alt="desk image"></img>
              <img src={clock} id="clockIMG" alt="clock image"></img>
              {
                timerComponents[timerCode]
              }
            <div id="animationDiv">
            </div>
          </div>
        </div>        
        </Fragment>
    );
  }
export default Pomodoro;

