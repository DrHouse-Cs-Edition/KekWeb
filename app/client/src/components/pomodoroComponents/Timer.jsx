import {useState, useEffect, Fragment, useRef} from 'react';
import { useTimer } from 'react-timer-hook';
import {GenOptionDisplayer} from "../GeneralOptionDisplayer.jsx"
import {TTform, CyclesForm} from "./FormSelector.jsx";

//*TMP for animation testing
import paper1 from "../../pages/images/paper/paperPile1.png"
import paper2 from "../../pages/images/paper/paperPile2.png"
import cat1 from "../../pages/images/cat/cat1.png"
import cat2 from "../../pages/images/cat/cat2.png"

//! for the animation, sycnh some interval on 1000ms and two frames of an animation with the timer
function SimpleTimer( {autoStart = 0} ){   //default is studyTime, expressed in seconds
    const [StudyTime, updateStudyTime] = useState(0);   //TODO choose format (seconds, milliseconds)
    const [BreakTime, updateBreakTime] = useState(0);   //TODO choose format (seconds, milliseconds)
    const [Cycles, updateCycles] = useState(0);         //indicates the number of full Cycles

    const [formType, updateFormType] = useState('TT');

    const [minutes, setMinutes] = useState(Math.trunc(StudyTime/60%60));        //current timer minutes value
    const [seconds, setSeconds] = useState(Math.trunc(StudyTime%60));           //current timer seconds value
    const [runTimer, setRunTimer] = useState(autoStart);                        //the timer is running? 1=yes, 0=no
    
    const curTimer = useRef(0);     //code for identifing current timer, if 0 it's the study timer, if 1 it's the break timer

    //function used for switching the form used for recording StudyTime, BreakTime and Cycles
    const changeForm = ()=>{
        formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
    }

    //function given to the forms for recording StudyTime, BreakTime, Cycles
    const passTimeData = (sData, bData, cData)=>{
        updateStudyTime(sData);
        updateBreakTime(bData);
        updateCycles(cData);
        //options have changed
        setRunTimer(0);
        curTimer.current = 0;
        setMinutes(Math.trunc(sData/60%60));
        setSeconds(Math.trunc(sData%60));
    }

    //*formComponents is an object, and TT and Cycles it's attributes. To the TT/Cycles attribute i assign a component
    //*to access a component i use a similar syntax to that of arrays. I can use a different component based on the index
    //*of the object (i'm accessing the component stored in the attribute)
    let formComponents = {
        TT : <TTform passTimeData={passTimeData}></TTform>,
        Cycles : <CyclesForm passTimeData={passTimeData}></CyclesForm>
    }

    let pomodoroInterval;   //used for storing the setTimeout return value. 

        const timer = useEffect(()=>{
            if(runTimer){   //normal update of the timer
                pomodoroInterval = setTimeout(()=>{ 
                    if(Cycles > 0){
                        if(seconds == 0){
                            if(minutes == 0){
                                if(curTimer.current){//study timer initialization
                                    updateCycles(Cycles-1); 
                                    console.log("-1 Cycles");
                                    if(Cycles <= 1 ){ //set to 1 because of latency from useState
                                        clearTimeout(pomodoroInterval); //immediate clear of Cycles
                                        console.log("clearing interval inside"); 
                                    }else{
                                        setSeconds(Math.trunc(StudyTime%60));
                                        setMinutes(Math.trunc(StudyTime/60%60));
                                    }     
                                } else{ //break timer initialization
                                    setSeconds(Math.trunc(BreakTime%60));
                                    setMinutes(Math.trunc(BreakTime/60%60));
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

    /* 
    *function used for restarting the current Cycles
    *If studyTime was running, it just resets.
    *If  breakTime was running, it switches to studyTime and begins anew
    *Calling this function stops the  current timer and resets the Cycles
    */
    const CyclesReset = ()=>{    
        setRunTimer(0);
        clearInterval(pomodoroInterval);
        setMinutes(Math.trunc(StudyTime/60%60));
        setSeconds(Math.trunc(StudyTime%60));
    }

    /* 
    *Function used for skipping the current Cycles.
    *It doesn't stop the current Cycles, differently from the reset currently implemented
    *by setting both minutes and seconds to 0, it will skip the current timer
    *by also setting curTimer to 1, it then  switches to the next Cycles and start the StudyCycles
    */
    const skipCycles = ()=>{
        alert("skipping Cycles");
        clearInterval(pomodoroInterval);
        setSeconds(0);
        setMinutes(0);
        curTimer.current = 1;
    }


      
    return(
        <Fragment>
            <div id= "timerDiv">
                <span>{minutes < 10 ? '0' + minutes : minutes} </span>
                <span>{seconds < 10 ? '0' + seconds : seconds} </span>
            </div>
            <div id = "timerCurrentVals">
                <GenOptionDisplayer optionA={StudyTime} optionB={BreakTime} optionC={Cycles}></GenOptionDisplayer>
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
        </Fragment>
    )
}

export {SimpleTimer};