import React, { Fragment, useState } from "react";
import Navbar from '../components/Navbar.jsx'
import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";
import Timer from "../components/pomodoroComponents/Timer.jsx"

//images section
import desk from "./images/desk.png"
import clock from "./images/clock2.png"
import "./pomodoro.css"
import { data } from "framer-motion/client";

function Pomodoro(){
  console.log("render check Pomodoro");

    const [formType, updateFormType] = useState('TT');
    const [aniState, updateAniState] = useState(0);
    let cycles=0;
    let breakTime=0;
    let study=0;

    //function to retrieve Time data from child components. 
    const passTimeData= (cData, bData, sData)=> {
      cycles = cData;
      breakTime = bData;
      study = sData;
      console.log("cycles are: ", cycles, " breakTime is: ", breakTime, "studyTime is: ", study);
    }

    let formComponents = {
      TT : <TTform passTimeData={passTimeData}></TTform>,
      Cycles : <CyclesForm passTimeData={passTimeData}></CyclesForm>
    }

    const changeForm = ()=>{
      formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
    }

    //formComponents is an object, and TT and Cycles it's attributes. To the TT/cycles attribute i assign a component
    //to access a component i use a similar syntax to that of arrays. I can use a different component based on the index
    //of the object (i'm accessing the component stored in the attribute)

    let currentComponent = formComponents[formType];

    return(
      <Fragment>
        {formComponents[formType]}

        <button onClick={changeForm}>Change Format</button>
        <button onClick = {()=>{
          if(!cycles || !breakTime || !study){  //data is not present
          console.log("cycles are: ", cycles, " breakTime is: ", breakTime, "studyTime is: ", study);
          alert("please insert timer settings");
          }
          else
          {
            updateAniState(1);
          }
        }} >Start</button>

        <div className="paperDestroyer3000">
          <div id="deskDiv">
            <img id="desk" src={desk} alt="desk image"></img>
              <img src={clock} id="clockIMG" alt="clock image"></img>
              <Timer duration={60}></Timer>
            <div id="animationDiv">
              {
                
              }
            </div>
          </div>
        </div>        
        </Fragment>
    );
  }
export default Pomodoro;

