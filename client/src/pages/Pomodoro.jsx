import React, { Fragment, useState } from "react";
import Navbar from '../components/Navbar.jsx'
import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";
import Animation from "../components/pomodoroComponents/Animation.jsx";

//images section
import desk from "./images/desk.png"
import clock from "./images/clock2.png"
import "./pomodoro.css"
import { data } from "framer-motion/client";

function Pomodoro(){

    const [formType, updateFormType] = useState('TT');
    const [aniState, updateAniState] = useState(0);
    let cycles;
    let breakTime;
    let study;

    //function to retrieve Time data from child components. 
    function passTimeData(cData, pData, sData){
      cycles = cData;
      breakTime = pData;
      study = sData;
      console.log("cycles are: ", cycles, " breakTime is: ", breakTime, "studyTime is: ", study);
    }

    let formComponents = {
      TT : <TTform passTimeData={passTimeData}></TTform>,
      Cycles : <CyclesForm passTimeData={passTimeData}></CyclesForm>
    }

    function changeForm(){
      formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
      console.log("changeForm");
      //switches the form type reference 
    }

    //formComponents is an object, and TT and Cycles it's attributes. To the TT/cycles attribute i assign a component
    //to access a component i use a similar syntax to that of arrays. I can use a different component based on the index
    //of the object (i'm accessing the component stored in the attribute)

    let currentComponent = formComponents[formType];
  
    
    //TODO update these variables from child forms and use them for animation
    return(
      <Fragment>
        {formComponents[formType]}
        <button onClick={changeForm}>Change Format</button>
        <button onClick = {()=>{
          updateAniState(1);
          //idea: ogni volta che cambia aniState fare una cosa diversa nel componente animation
        }} >Start</button>
        <button >Reset</button>
        <button >Stop</button>
        <button >Clear</button>
        <div className="paperDestroyer3000">
          <div id="deskDiv">
            <img id="desk" src={desk} alt="desk image"></img>
              <img src={clock} id="clockIMG" alt="clock image"></img>
              <div className="timer" id="timerDisplay">
                00:00
              </div>
            <div id="animationDiv">
              {
                <Animation aniState={aniState}></Animation>
              }
            </div>
          </div>
        </div>        
        </Fragment>
    );
  }
export default Pomodoro;

