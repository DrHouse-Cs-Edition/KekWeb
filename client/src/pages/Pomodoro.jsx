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
    let [cycles, updateCycles] = useState(0); //the number of cycles is updated AFTER said cycle is completed
    let [breakTime, updateBreakTime] = useState(0);
    let [studyTime, updateStudyTime] = useState(0);
    let [timerCode, setTimerCode] = useState(0); //0 = study, 1 = break UNLESS cycles=0

    let timerComponents = {
      studyTimer : <Timer duration = {studyTime}></Timer>, //timer that runs during the study cycle
      breakTimer : <Timer duration = {breakTime}></Timer>, //timer that runs during the break cycle
      defaultTimer : <Timer ></Timer>//TODO default timer or other type of content, for absence of cycle

      //TODO a function that swaps based on what cycle, if any, should be running. Might need a callback for notifying the end of a cycle
    }
    //function to retrieve Time data from child components. 
    const passTimeData = (cData, bData, sData)=>{
      updateCycles(cData);
      updateBreakTime(bData);
      updateStudyTime(sData);
    }

    useEffect(()=>{
      console.log("cycles are: ", cycles, " breakTime is: ", breakTime, "studyTime is: ", studyTime);
    }, [cycles, breakTime, studyTime])

    //formComponents is an object, and TT and Cycles it's attributes. To the TT/cycles attribute i assign a component
    //to access a component i use a similar syntax to that of arrays. I can use a different component based on the index
    //of the object (i'm accessing the component stored in the attribute)
    let formComponents = {
      TT : <TTform passTimeData={passTimeData}></TTform>,
      Cycles : <CyclesForm passTimeData={passTimeData}></CyclesForm>
    }

    const changeForm = ()=>{
      formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
    }


    //function that changes the timer component based on if cycles ar running AND THEN what cycle just ended
    //Must be used for a Hard reset (pressing the rest button). Soft resets (end of cycles) should be automatic
    //given that cycles = 0 and, given that we end on a break, the next switch will be to a Study.
    const switchTimer = ()=>{
      //cases: IF cycles > 0 
      //0 = study, 1 = break
      //ELSE default

      setTimerCode(Math.abs(1-timerCode))
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
              <Timer duration={60}></Timer>
            <div id="animationDiv">
            </div>
          </div>
        </div>        
        </Fragment>
    );
  }
export default Pomodoro;

