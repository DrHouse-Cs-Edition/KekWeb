import {useState, useEffect, Fragment, useRef} from 'react';
import { useParams } from 'react-router-dom';
import {GenOptionDisplayer} from "../utils/GeneralOptionDisplayer.jsx"
import {TTform, CyclesForm} from "./FormSelector.jsx";
import {Input} from "../utils/Input.jsx";
import {FormProvider, useForm} from "react-hook-form";
import React from 'react';
import { Animation } from "./Animation/Animation.jsx";
import style from "./Timer.module.css"

function SimpleTimer( {autoStart = 0} ){   //default is studyTime, expressed in seconds
    const formMethods = useForm();
 
    //* THESE 3 STATES CONTAIN THE POMODORO SETTING FOR SAVING AND STARTING
    //* THEY ARE NOT USED FOR THE TIMER ITSELF */
    const [StudyTime, updateStudyTime] = useState(0);           //TODO choose format (seconds, milliseconds)
    const [BreakTime, updateBreakTime] = useState(0);           //TODO choose format (seconds, milliseconds)
    const [Cycles, updateCycles] = useState(0);                 //indicates the number of full Cycles
    //********************************************************************* */

    //*THIS STATE CONTAINS THE CURRENT FORM SELECTED
    const [formType, updateFormType] = useState('Cycles');
    //* VAR USED FOR ALTERNATING BETWEEN THE SAVE BUTTON PLACEHOLDER AND THE BUTTON ITSELF
    const [saveButton, setSaveButton] = useState("no"); //true = save button visible, false = save button ivisible and substituted with a placeholder   

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

    //function used for switching the form used for recording StudyTime, BreakTime and Cycles
    const changeForm = ()=>{
        formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
    } 
    //object with two items: no and yes, used for toggling the save button visibility
    let saveButtonComponent = {
        no : <p> please fill and register the fields in order to save the pomodoro</p>,
        yes : <FormProvider {...formMethods} >
            <Input
            label = {"PomodoroTitle"}
            type = "string"
            id = "Pomodoro Title"
            placeholder={"my Pomodoro"}
            validationMessage={"please enter a title"}
            ></Input>
        </FormProvider>
    }


    //* FUNCTION USED FOR SHOWING THE REGISTER POMODORO BUTTON IF THE FIELDS ARE FILLED
    useEffect(()=>{ StudyTime && BreakTime && Cycles ? setSaveButton("yes") : setSaveButton("no")}, [StudyTime, BreakTime, Cycles])

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

        console.log("Timer: data has been recieved, showing timer options ");
        runButtonRef.current.style.visibility = "visible";
    }

    //*FORMCOMPONENTS IS AN OBJECT USED FOR STORING THE FORMCOMPONENTS USED FOR RECORDING STUDYTIME, BREAKTIME AND CYCLES
    //It is possible to access it's fields as if it was an array using the square brackets []
    let formComponents = { TT : <TTform passTimeData={passTimeData} ></TTform>, Cycles : <CyclesForm passTimeData={passTimeData}></CyclesForm> }   

    //*USE FOR STORING THE SETTIMEOUT RETURN VALUE
    let pomodoroInterval;
    const timer = useEffect(()=>{
        if(runTimer){   //normal update of the timer
            pomodoroInterval = setTimeout(()=>{
                if(cyclesLeft > 0){
                    if(seconds == 0){
                        if(minutes == 0){
                            if(curTimer){//break timer ended, initializing study timer
                                setCyclesLeft(cyclesLeft-1);
                                console.log("-1 Cycles");
                                if(cyclesLeft <= 1 ){ //set to 1 because of latency from useState
                                    clearTimeout(pomodoroInterval); //immediate clear of Cycles
                                    setRunTimer(0);
                                    console.log("clearing interval inside");
                                }else{
                                    setSeconds(Math.trunc(StudyTime%60));
                                    setMinutes(Math.trunc(StudyTime/60%60));
                                    console.log("initializing study timer");
                                }
                            } else{ //break timer initialization
                                setSeconds(Math.trunc(BreakTime%60));
                                setMinutes(Math.trunc(BreakTime/60%60));
                                console.log("initializing break timer");
                            }
                            updateCurTimer (curTimer => curTimer ^ 1);
                                console.log("cur time is now ", curTimer);
                            }else
                            {
                                setSeconds(59);
                                setMinutes(minutes-1);
                            }
                    }else
                    setSeconds(seconds - 1);
                }else { clearTimeout(pomodoroInterval); console.log("clearing interval"); } //failsafe clear of Cycles
            }, 1000);
        }
    }, [minutes, seconds, runTimer]);

    const stopTimer = ()=>{
        clearTimeout(pomodoroInterval); //stops the timer from updating preemtively (no lag since pressing the button)
        setRunTimer(0); //stops further updates, still running the useEffect
    }

    //*function used for restarting the current Cycles
    //*If studyTime was running, it just resets.
    //*If  breakTime was running, it switches to studyTime and begins anew
    //*Calling this function stops the  current timer and resets the Cycles
    const CyclesReset = ()=>{
        setRunTimer(0);
        updateCurTimer(curTimer => 0);
        clearInterval(pomodoroInterval);
        setMinutes(Math.trunc(StudyTime/60%60));
        setSeconds(Math.trunc(StudyTime%60));
        setResetFlag(resetFlag => resetFlag ^ 1);
    }

    //*Function used for skipping the current Cycles.
    //*It doesn't stop the current Cycles, differently from the reset currently implemented
    //*by setting both minutes and seconds to 0, it will skip the current timer
    //*by also setting curTimer to 1, it then  switches to the next Cycles and start the StudyCycles
    const skipCycles = ()=>{
        alert("skipping Cycles");
        clearInterval(pomodoroInterval);
        setSeconds(0);
        setMinutes(0);
        updateCurTimer (curTimer => 1)
    }

    //*FUNCTION CALLED WHEN THE USER ASKS TO SAVE THE CURRENT POMODORO SETTINGS
    //*IT CAN BE CALLED ONLY WHENE ALL PREVIOUS DATA HAS BEEN SET
    //!it references saveP in pomodoro.js
    //TODO check for pomodoro title
    const onSubmit = async (data)=>{
        console.log("title is :", data.PomodoroTitle);
        fetch('http://localhost:5000/api/Pomodoro/saveP', {
            method : 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body : JSON.stringify({
                title : data.PomodoroTitle,
                studyTime : StudyTime,
                breakTime : BreakTime,
                cycles : Cycles
            })
        }).then( res => res.json())
        .then( json => {
            console.log(json);
            console.log("response to savePomodoro was ", json)
        })
        .catch(error => console.log(" Timer.onSubmit: error is "+ error));
    }
    
    //*FUNCTION CALLAED WHENE THE USER ATTEMPTED A POMODORO SAVE BUT WAS UNSUCCESFULL
    const onError = ()=>{
        console.log("error in saving the pomodoro detected");
    }

    return(
        <div className={style.mainDiv} id='mainDiv' >
            <div className={style.headerDiv}>
                <span className={style.timerDisplay}>{minutes < 10 ? '0' + minutes : minutes} </span>
                <span className={style.timerDisplay}>{seconds < 10 ? '0' + seconds : seconds} </span>
            </div>
                
            <div id = {style.timerCurrentVals}>
                <GenOptionDisplayer optionA={StudyTime} optionB={BreakTime} optionC={cyclesLeft}></GenOptionDisplayer>
            </div>
            <div id={style.buttonsDiv} >
                <h2> Testing buttons below </h2>
                <button onClick={()=>{setRunTimer(1)}} ref={runButtonRef} style={{visibility : 'hidden'}}> run timer </button>
                <button onClick={stopTimer} ref={stopButtonRef}> Stop timer </button>
                <button onClick={CyclesReset} ref={resetButtonRef}> Reset Cycles </button>
                <button onClick={skipCycles} ref={skipButtonRef}> Skip Cycles</button>
            </div>

            <div id= "FormDiv" style={{textAlign : 'center'}}>
                {formComponents[formType]}
                <button onClick={changeForm} ref={formatButtonRef}>Change Format</button>
            </div>

            <br></br>
            {saveButtonComponent[saveButton]}                
            <button onClick={formMethods.handleSubmit(onSubmit, onError) } ref={saveButtonRef} > Save Pomodoro settings </button>

            <Animation currentTimer = {curTimer} studyTime = {StudyTime} breakTime = {BreakTime} run = {runTimer} resetFlag={resetFlag}/>
        </div>
    )
}

export {SimpleTimer};