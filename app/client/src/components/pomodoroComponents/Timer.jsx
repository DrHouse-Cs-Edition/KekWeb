import {useState, useEffect, Fragment, useRef} from 'react';
import { useParams } from 'react-router-dom';
import {GenOptionDisplayer} from "../GeneralOptionDisplayer.jsx"
import {TTform, CyclesForm} from "./FormSelector.jsx";
import {Input} from "../Input.jsx";
import style from "./Timer.module.css"
import {FormProvider, useForm} from "react-hook-form";


//*TMP for animation testing

//! for the animation, sycnh some interval on 1000ms and two frames of an animation with the timer
function SimpleTimer( {autoStart = 0} ){   //default is studyTime, expressed in seconds
    const { id } = useParams(); // id come Parametro di percorso ( Note/:id )
    const formMethods = useForm();
 
    //* THESE 3 STATES CONTAIN THE POMODORO SETTING FOR SAVING AND STARTING
    //* THEY ARE NOT USED FOR THE TIMER ITSELF */
    const [StudyTime, updateStudyTime] = useState(0);           //TODO choose format (seconds, milliseconds)
    const [BreakTime, updateBreakTime] = useState(0);           //TODO choose format (seconds, milliseconds)
    const [Cycles, updateCycles] = useState(0);                 //indicates the number of full Cycles
    //const [PomodoroTitle, updatePomodoroTitle]= useState('');   //title of the current Pomodoro
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
    const curTimer = useRef(0);                                                 //code for identifing current timer, if 0 it's the study timer, if 1 it's the break timer
    //********************************************************************* */

    //function used for switching the form used for recording StudyTime, BreakTime and Cycles
    const changeForm = ()=>{
        formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
    } 

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

    useEffect(()=>{
            //* FUNCTION USED FOR SHOWING THE REGISTER POMODORO BUTTON IF THE FIELDS ARE FILLED
            if ( StudyTime && BreakTime && Cycles ){
                setSaveButton("yes");            
            }else{
                setSaveButton("no");
            }
    }, [StudyTime, BreakTime, Cycles])

    //*function given to the forms for recording StudyTime, BreakTime, Cycles
    const passTimeData = (sData, bData, cData)=>{
        //inside this function, use the data passed as parameters instead of renewed vals as they'll be updated after a rerender
        updateStudyTime(sData);
        updateBreakTime(bData);
        updateCycles(cData);
        //options have changed
        setRunTimer(0);
        curTimer.current = 0;
        setMinutes(Math.trunc(sData/60%60));
        setSeconds(Math.trunc(sData%60));
        setCyclesLeft(cData);
    }

    //*formComponents is an object, and TT and Cycles it's attributes. To the TT/Cycles attribute i assign a component
    //*to access a component i use a similar syntax to that of arrays. I can use a different component based on the index
    //*of the object (i'm accessing the component stored in the attribute)
    let formComponents = {
        TT : <TTform passTimeData={passTimeData} ></TTform>,
        Cycles : <CyclesForm passTimeData={passTimeData}></CyclesForm>
    }   

    let pomodoroInterval;   //used for storing the setTimeout return value.

        const timer = useEffect(()=>{
            if(runTimer){   //normal update of the timer
                pomodoroInterval = setTimeout(()=>{
                    if(cyclesLeft > 0){
                        if(seconds == 0){
                            if(minutes == 0){
                                if(curTimer.current){//break timer ended, initializing study timer
                                    setCyclesLeft(cyclesLeft-1);
                                    console.log("-1 Cycles");
                                    if(cyclesLeft <= 1 ){ //set to 1 because of latency from useState
                                        clearTimeout(pomodoroInterval); //immediate clear of Cycles
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
                                curTimer.current = !curTimer.current;
                                console.log("cur time is now ", curTimer.current);
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
        setRunTimer(false); //stops further updates, still running the useEffect
    }

    //*function used for restarting the current Cycles
    //*If studyTime was running, it just resets.
    //*If  breakTime was running, it switches to studyTime and begins anew
    //*Calling this function stops the  current timer and resets the Cycles
    const CyclesReset = ()=>{
        setRunTimer(0);
        clearInterval(pomodoroInterval);
        setMinutes(Math.trunc(StudyTime/60%60));
        setSeconds(Math.trunc(StudyTime%60));
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
        curTimer.current = 1;
    }

    //*FUNCTION CALLED WHEN THE USER ASKS TO SAVE THE CURRENT POMODORO SETTINGS
    //*IT CAN BE CALLED ONLY WHENE ALL PREVIOUS DATA HAS BEEN SET
    //saveP
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
        <Fragment>
            <div className={style.timerDiv}>
                <span className={style.timerDisplay}>{minutes < 10 ? '0' + minutes : minutes} </span>
                <span className={style.timerDisplay}>{seconds < 10 ? '0' + seconds : seconds} </span>
            <div id = "timerCurrentVals">
                <GenOptionDisplayer optionA={StudyTime} optionB={BreakTime} optionC={cyclesLeft}></GenOptionDisplayer>
            </div>
            <div id="testingDiv">
                <h2> Testing buttons below </h2>
                <button onClick={()=>{setRunTimer(1)}}> run timer </button>
                <button onClick={stopTimer}> Stop timer </button>
                <button onClick={CyclesReset}> Reset Cycles </button>
                <button onClick={skipCycles}> Skip Cycles</button>
            </div>

            <div id= "FormDiv" style={{ textAlign : 'center'}}>
                {formComponents[formType]}
            </div>

            <button onClick={changeForm}>Change Format</button>

            <br></br>
            {saveButtonComponent[saveButton]}                
            <button onClick={formMethods.handleSubmit(onSubmit, onError)} > Save Pomodoro settings </button>

            </div>
        </Fragment>
    )
}

export {SimpleTimer};