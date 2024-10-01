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

    function changeForm(){
      formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
      console.log("changeForm");
      //switches the form type reference 
    }

    //formComponents is an object, and TT and Cycles it's attributes. To the TT/cycles attribute i assign a component
    //to access a component i use a similar syntax to that of arrays. I can use a different component based on the index
    //of the object (i'm accessing the component stored in the attribute)

    let currentComponent = formComponents[formType];
  
    return (
      <Fragment>
        {formComponents[formType]}
        <button onClick={changeForm}>Change Format</button>
        <div className="paperDestroyer3000">
          <div id="deskDiv">
            <img id="desk" src={desk} alt="desk image"></img>
              <img src={clock} id="clockIMG" alt="clock image"></img>
              <div className="timer" id="timerDisplay">
                00:00
              </div>
            <div id="paperDiv">
              <img src={paper1} id="imageSpace" alt="two big piles of paper"></img>
            </div>
          </div>
        </div>        
        </Fragment>
    );
  }
export default Pomodoro;