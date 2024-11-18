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
  return(
    <Fragment>
      <SimpleTimer/>
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