import React, { Fragment, useState, useEffect } from "react";
import Navbar from '../components/Navbar.jsx'
import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";
import { SimpleTimer } from "../components/pomodoroComponents/Timer.jsx"
import styles from "./Pomodoro.module.css"


//images section
import desk from "./images/desk.png"
import clock from "./images/clock2.png"

function Pomodoro(){
  console.log("render check Pomodoro");
  return(
    <Fragment>
      <SimpleTimer/>    
      </Fragment>
  );
}
export default Pomodoro;