import React, { Fragment, useEffect, useState } from "react";
import Navbar from '../components/Navbar.jsx'
import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";

//images section
import desk from "./images/desk.png"
import clock from "./images/clock2.png"
import paper1 from "./images/paper/paperPile1.png"
import "./pomodoro.css"

function Pomodoro(){

    let [formType, updateFormType] = useState('TT');
    let formComponents = {
      TT : <TTform></TTform>,
      Cycles : <CyclesForm></CyclesForm>
    }
    //formComponents is an object, and TT and Cycles it's attributes. To the TT/cycles attribute i assign a component
    //to access a component i sue a similar syntax to that of arrays

    let currentComponent = formComponents[formType];
  
    return (
      <Fragment>
        <div className="paperDestroyer3000">
          <div id="deskDiv">
            <img id="desk" src={desk}></img>
              <img src={clock} id="clockIMG"></img>
              <div className="timer" id="timerDisplay">
                00:00
              </div>
            <div id="paperDiv">
              <img src={paper1} id="imageSpace"></img>
            </div>
          </div>
        </div>

        <button >Change Format</button>
        </Fragment>
    );
  }
export default Pomodoro;