import {useState, useEffect, Fragment, useRef} from 'react';
import { useParams } from 'react-router-dom';
import {GenOptionDisplayer} from "../utils/GeneralOptionDisplayer.jsx"
import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";
import {Input} from "../utils/InputV2.jsx";
import {FormProvider, useForm} from "react-hook-form";
import React from 'react';
import { Animation } from "../components/pomodoroComponents/Animation/Animation.jsx";
import style from "./Pomodoro.module.css"
import {UseToken} from '../components/login_signup/UserHooks.jsx';
import PomodoroSideBar from '../components/pomodoroComponents/PomodoroSideBar.jsx';

function Pomodoro( {autoStart = 0} ){   //default is studyTime, expressed in seconds
    const formMethods = useForm();
    const {token, setToken} = UseToken();
    //* THESE 3 STATES CONTAIN THE POMODORO SETTING FOR SAVING AND STARTING
    //* THEY ARE NOT USED FOR THE TIMER ITSELF */
    const [pomodoroId, setPomodoroId] = useState(0);
    const [pomodoroTitle, setPomodoroTitle] = useState(0);
    const [StudyTime, updateStudyTime] = useState(0);           //TODO choose format (seconds, milliseconds)
    const [BreakTime, updateBreakTime] = useState(0);           //TODO choose format (seconds, milliseconds)
    const [Cycles, updateCycles] = useState(0);                 //indicates the number of full Cycles
    //********************************************************************* */

    //*THIS STATE CONTAINS THE CURRENT FORM SELECTED
    const [formType, updateFormType] = useState('Cycles');

    //* THESE STATES CONTAIN THE CURRENT TIME AND CYCLES LEFT TO RUN
    //* THEY ARE NOT THE SETTINGS FOR THE POMODORO, THEY ARE EFFECTIVELY THE RUNNING CLOCK + OTHER TOOLS
    const [minutes, setMinutes] = useState(Math.trunc(StudyTime/60%60));        //current timer minutes value
    const [seconds, setSeconds] = useState(Math.trunc(StudyTime%60));           //current timer seconds value
    const [cyclesLeft, setCyclesLeft] = useState(Cycles);                       //variable used for storing current, running timer cycles left to do
    const [runTimer, setRunTimer] = useState(autoStart);                        //the timer is running? 1=yes, 0=no
    const [curTimer, updateCurTimer] = useState(0);      //0 = study, 1 = break                                           //code for identifing current timer, if 0 it's the study timer, if 1 it's the break timer
    const [resetFlag, setResetFlag] = useState(0); //flag used for resetting the timer when a cycle is finished
    //********************************************************************* */

    //*REFERENCES TO THE HTML ELEMENTS
    const runButtonRef = useRef(null);
    const stopButtonRef = useRef(null);
    const resetButtonRef = useRef(null);
    const skipButtonRef = useRef(null);
    const registerButtonRef = useRef(null);
    const formatButtonRef = useRef(null);
    const saveButtonRef = useRef(null);
    const titleInputRef = useRef(null);

    const [disableSave, setDisableSave] = useState(1);
    const [disableRun, setDisableRun] = useState(1);

    let titleComponent2 = <input
    onInput={(event)=>{setPomodoroTitle(event.target.value)}}
    className={style.PomodoroTitleInput}
    value={pomodoroTitle}>
    </input>

    //function used for switching the form used for recording StudyTime, BreakTime and Cycles
    const changeForm = ()=>{
        formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
    } 

    //*FUNCTION GIVEN TO THE FORM FOR RECORDING STUDYTIME, BREAKTIME AND CYCLES
    const passTimeData = (sData, bData, cData)=>{
        //inside this function, use the data passed as parameters instead of renewed vals as they'll be updated after a rerender
        updateStudyTime(sData);
        updateBreakTime(bData);
        updateCycles(cData);
        //options have changed
        setRunTimer(0);
        updateCurTimer (curTimer => 0);
        setMinutes(Math.trunc(sData/60%60));
        setSeconds(Math.trunc(sData%60));
        setCyclesLeft(cData);

        setDisableRun(0);
    }

    function loadPomodoro(id, title, studyT, breakT, cycles){
      passTimeData(studyT, breakT, cycles);
      setPomodoroId(id);
      setPomodoroTitle(title);
      console.log("loading pomodoro from Pomodoro: ", title);
    }

    useEffect(()=>{
        if( pomodoroId || pomodoroTitle)     //if there is an ID present, i am updating a pomodoro
            setDisableSave(0);
        else
            setDisableSave(1);
    },[pomodoroId, pomodoroTitle]);

    //*FORMCOMPONENTS IS AN OBJECT USED FOR STORING THE FORMCOMPONENTS USED FOR RECORDING STUDYTIME, BREAKTIME AND CYCLES
    //It is possible to access it's fields as if it was an array using the square brackets []
    let formComponents = { TT : <TTform passTimeData={passTimeData} ></TTform>, Cycles : <CyclesForm passTimeData={passTimeData}></CyclesForm> }   

    //*USE FOR STORING THE SETTIMEOUT RETURN VALUE
    let pomodoroInterval;
    //*FUNCTION USED FOR STARTING THE POMODORO
    const timer = useEffect(()=>{
        if(runTimer){   //normal update of the timer
            pomodoroInterval = setTimeout(()=>{
                if(cyclesLeft > 0){
                    if(seconds == 0){
                        if(minutes == 0){
                            if(curTimer){//break timer ended, initializing study timer
                                setCyclesLeft(cyclesLeft-1);
                                if(cyclesLeft <= 1 ){ //set to 1 because of latency from useState
                                    clearTimeout(pomodoroInterval); //immediate clear of Cycles
                                    setRunTimer(0);
                                }else{
                                    setSeconds(Math.trunc(StudyTime%60));
                                    setMinutes(Math.trunc(StudyTime/60%60));
                                    alert("ugh, back to studying huh?")
                                }
                            } else{ //break timer initialization
                                setSeconds(Math.trunc(BreakTime%60));
                                setMinutes(Math.trunc(BreakTime/60%60));
                                alert("Time for a break!");
                            }
                            updateCurTimer (curTimer => curTimer ^ 1);
                            }else
                            {
                                setSeconds(59);
                                setMinutes(minutes-1);
                            }
                    }else
                    setSeconds(seconds - 1);
                }else { clearTimeout(pomodoroInterval); } //failsafe clear of Cycles
            }, 1000);
        }
    }, [minutes, seconds, runTimer]);

    function stopTimer(){
        clearTimeout(pomodoroInterval); //stops the timer from updating preemtively (no lag since pressing the button)
        setRunTimer(0); //stops further updates, still running the useEffect
    }

    //*function used for restarting the current Cycles
    //*If studyTime was running, it just resets.
    //*If  breakTime was running, it switches to studyTime and begins anew
    //*Calling this function stops the  current timer and resets the Cycles
    function CyclesReset(){
        setRunTimer(0);
        updateCurTimer(0);
        clearInterval(pomodoroInterval);
        setMinutes(Math.trunc(StudyTime/60%60));
        setSeconds(Math.trunc(StudyTime%60));
        setResetFlag(resetFlag => resetFlag ^ 1);
        //^ is an operand that allows to switch from 0 to 1 and vice versa
    }

    function gotoNext(){
        clearInterval(pomodoroInterval);
        setSeconds(0);
        setMinutes(0);
    }
    //*Function used for skipping the current full cycle (both study and break)
    //*It doesn't stop the current Cycles, differently from the reset currently implemented
    //*by setting both minutes and seconds to 0, it will skip the current timer
    //*by also setting curTimer to 1, it then  switches to the next Cycles and start the StudyCycles
    function skipCycles(){
        gotoNext();
        updateCurTimer(1);
    }

    function newPomodoro (){
        loadPomodoro(0,0,0,0,0);
        setMinutes(0);
        setSeconds(0);
        setCyclesLeft(0);
    }

    //*FUNCTION CALLED WHEN THE USER ASKS TO SAVE THE CURRENT POMODORO SETTINGS
    //*IT CAN BE CALLED ONLY WHENE ALL PREVIOUS DATA HAS BEEN SET
    //!it references saveP in pomodoro.js
    //TODO check for pomodoro title
    const onSubmit = async (data)=>{
        console.log(pomodoroTitle + " titolo")
        if(pomodoroId){ //updating existing pomodoro
            fetch('/api/Pomodoro/renameP', {
            method : 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body : JSON.stringify({
                token : token,
                title : pomodoroTitle,
                studyTime : StudyTime,
                breakTime : BreakTime,
                cycles : Cycles,
                id : pomodoroId
            })
        }).then( res => res.json())
        .catch(error => console.log(" Pomodoro.onSubmit: error is " + error));
        console.log("renaming to ", pomodoroTitle)
        return;
        }
        //creating new pomodoro
        fetch('/api/Pomodoro/saveP', {
            method : 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body : JSON.stringify({
                token : token,
                title : pomodoroTitle,
                studyTime : StudyTime,
                breakTime : BreakTime,
                cycles : Cycles
            })
        }).then( res => res.json())
        .then(data => console.log(data))
        .catch(error => console.log(" Timer.onSubmit: error is " + error));
    }
    
    //*FUNCTION CALLAED WHENE THE USER ATTEMPTED A POMODORO SAVE BUT WAS UNSUCCESFULL
    const onError = ()=>{
        console.log("error in saving the pomodoro detected");
    }

    return(
      <div className={style.Pomodoro} id='mainDiv' >
        <div className={style.mainDiv}>
          <div className={style.headerDiv}>
            <span className={style.timerDisplay}>{titleComponent2} </span><br></br>
            <span className={style.timerDisplay}>{minutes < 10 ? '0' + minutes : minutes} </span>
            <span className={style.timerDisplay}>{seconds < 10 ? '0' + seconds : seconds} </span>
          </div>
              
          <div id = {style.timerCurrentVals}>
              <GenOptionDisplayer optionA={StudyTime} optionB={BreakTime} optionC={cyclesLeft}></GenOptionDisplayer>
          </div>
          <div id={style.buttonsDiv} >
              <h2> Testing buttons below </h2>
              <button onClick={()=>{setRunTimer(1)}} ref={runButtonRef} disabled={disableRun}> run timer </button>
              <button onClick={()=>{stopTimer()}} ref={stopButtonRef}> Stop timer </button>
              <button onClick={()=>{CyclesReset()}} ref={resetButtonRef}> Reset Cycles </button>
              <button onClick={()=>{skipCycles()}} ref={skipButtonRef}> Skip Cycles</button>
              <button onClick={()=>{gotoNext()}} ref={skipButtonRef}> next</button>
          </div>

          <div id= "FormDiv" style={{textAlign : 'center'}}>
              {formComponents[formType]}
              <button onClick={changeForm} ref={formatButtonRef}>Change Format</button>
          </div>

          <br></br>
          <button onClick = {()=>{newPomodoro()}}>new pomodoro</button>                
          <button onClick={formMethods.handleSubmit(onSubmit, onError) } ref={saveButtonRef} disabled={disableSave} > { pomodoroId ? "Update pomodoro" : "Save Pomodoro settings"} </button>

          <Animation currentTimer = {curTimer} studyTime = {StudyTime} breakTime = {BreakTime} run = {runTimer} resetFlag={resetFlag}/>
        </div>
        <div className={style.sideBar}>
          <PomodoroSideBar loadPomodoro = {loadPomodoro} deleteCallback={newPomodoro}></PomodoroSideBar>
        </div>   
      </div>
    )
}

export default Pomodoro;