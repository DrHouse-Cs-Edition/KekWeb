import React, { Fragment, useState, useEffect } from "react";
import Navbar from '../components/Navbar.jsx'
import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";
import { SimpleTimer } from "../components/pomodoroComponents/Timer.jsx"

import styles from "./Pomodoro.module.css"
function Pomodoro(){
  return(
    <div className="mainDiv">
      <SimpleTimer/>
    </div>
  );
}
export default Pomodoro;