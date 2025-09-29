import {useState, useEffect, useRef} from 'react';
import { useLocation } from 'react-router-dom';

import {useForm} from "react-hook-form";

import style from "./Pomodoro.module.css"

import {GenOptionDisplayer} from "../utils/GeneralOptionDisplayer.jsx"

// import {UseToken} from '../components/login_signup/UserHooks.jsx';

import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";
import Animation2 from "../components/pomodoroComponents/Animation/newAnimation.jsx"
import PomodoroSideBar from '../components/pomodoroComponents/PomodoroSideBar.jsx';

function Pomodoro( {autoStart = 0} ){   //default is studyTime, expressed in seconds
    const formMethods = useForm();
    // const {token, setToken} = UseToken();
    const location = useLocation();
    //* THESE 5 STATES CONTAIN THE POMODORO SETTING FOR SAVING AND STARTING
    //* THEY ARE NOT USED FOR THE TIMER ITSELF */
    const [pomodoroId, setPomodoroId] = useState(0);
    const [pomodoroTitle, setPomodoroTitle] = useState("");
    const [StudyTime, updateStudyTime] = useState(0);       //TODO set to minutes and seconds
    const [BreakTime, updateBreakTime] = useState(0);
    const [Cycles, updateCycles] = useState(0);                 //indicates the number of full Cycles
    //********************************************************************* */

    //*THIS STATE CONTAINS THE CURRENT FORM SELECTED
    const [formType, updateFormType] = useState('Cycles');
    const [isModing, updateModing] = useState(0);

    //* THESE STATES CONTAIN THE CURRENT TIME AND CYCLES LEFT TO RUN
    //* THEY ARE NOT THE SETTINGS FOR THE POMODORO, THEY ARE EFFECTIVELY THE RUNNING CLOCK + OTHER TOOLS
    const [minutes, setMinutes] = useState(StudyTime);          //current timer minutes value
    const [seconds, setSeconds] = useState(0);                  //current timer seconds value
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
    const formatButtonRef = useRef(null);
    const saveButtonRef = useRef(null);

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
        setMinutes(sData);
        setSeconds(0);
        setCyclesLeft(cData);
        if(pomodoroTitle)
            setDisableSave(0)
    }

    function loadPomodoro (id, title, studyT, breakT, cycles){
      passTimeData(studyT, breakT, cycles);
      setPomodoroId(id);
      setPomodoroTitle(title);
    }

    function serverSideUpdateCycles(x){
        fetch('/api/Pomodoro/cyclesUpdate', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body : JSON.stringify({
                id: pomodoroId+"",
                cycles: x,
                title: pomodoroTitle+""
            })
        })
    }


    //Funtction used to render data recieved from another page, by checking the location state
    useEffect( ()=>{
        if(location?.state){
            // switch (location.state.source){
            //     case  "":
            //         break;
            // }
            const {_id, title, studyTime, breakTime, cycles} = location.state;
            loadPomodoro(_id, title, studyTime, breakTime, cycles);
        }
    },[])

    useEffect(()=>{
        if( pomodoroId || pomodoroTitle && StudyTime && BreakTime && Cycles)     //if there is an ID present, i am updating a pomodoro
            setDisableSave(0);
        else
            setDisableSave(1);
    },[pomodoroId, pomodoroTitle]);

    useEffect(()=>{
        if(isModing){
            setDisableRun(1);
        }else{
            if(StudyTime && BreakTime && Cycles){
                setDisableRun(0);        //can run if there is a pomodoro loaded and is not being modified
            }else{
                setDisableRun(1);
            }
        }
    },[StudyTime, BreakTime, Cycles, isModing])

    //*FORMCOMPONENTS IS AN OBJECT USED FOR STORING THE FORMCOMPONENTS USED FOR RECORDING STUDYTIME, BREAKTIME AND CYCLES
    //It is possible to access it's fields as if it was an array using the square brackets []
    let formComponents = { TT : <TTform passTimeData={passTimeData} isNewPomodoro = {pomodoroId ? 0 : 1}></TTform>, Cycles : <CyclesForm passTimeData={passTimeData} isNewPomodoro = {pomodoroId ? 0 : 1}></CyclesForm> }   

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
                                let x = cyclesLeft -1;
                                serverSideUpdateCycles(x);
                                if(cyclesLeft <= 1 ){ //set to 1 because of latency from useState
                                    clearTimeout(pomodoroInterval); //immediate clear of Cycles
                                    setRunTimer(0);
                                    alert("Pomodoro Terminato!")
                                    newPomodoro();
                                }else{
                                    setSeconds(0);
                                    setMinutes(Math.trunc(StudyTime%60));
                                    alert("ugh, si ritorna allo studio huh?");
                                    setCyclesLeft(x);
                                }
                            } else{ //study timer ended, initializing break timer
                                setSeconds(0);
                                setMinutes(Math.trunc(BreakTime%60));
                                alert("Era ora, una bella pausa!");
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
        setMinutes(Math.trunc(StudyTime%60));
        setSeconds(0);
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
        loadPomodoro(0,"",0,0,0);
        setMinutes(0);
        setSeconds(0);
        setCyclesLeft(0);
    }

    //*FUNCTION CALLED WHEN THE USER ASKS TO SAVE THE CURRENT POMODORO SETTINGS
    //*IT CAN BE CALLED ONLY WHENE ALL PREVIOUS DATA HAS BEEN SET
    //!it references saveP in pomodoro.js
    //TODO check for pomodoro title
    const onSubmit = async (data)=>{
        if(pomodoroId){ //updating existing pomodoro
            fetch('/api/Pomodoro/updateP', {
            method : 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body : JSON.stringify({
                // token : token,
                title : pomodoroTitle,
                studyTime : StudyTime,
                breakTime : BreakTime,
                cycles : Cycles,
                id : pomodoroId
            })
        }).then( res => res.json())
        .then(()=>{
            alert("pomodoro aggiornato")
            window.location.reload();
        })
        .catch(error => {
            alert("errore nell'aggiornamento del pomdoro")
        });
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
                // token : token,
                title : pomodoroTitle,
                studyTime : StudyTime,
                breakTime : BreakTime,
                cycles : Cycles
            })
        }).then( res => {res.json();
            alert("pomodoro creato");
        })
        .then(window.location.reload())
        .catch(error => {
            alert("errore nella creazione del pomodoro" + error)
        });
    }
    
    //*FUNCTION CALLAED WHENE THE USER ATTEMPTED A POMODORO SAVE BUT WAS UNSUCCESFULL
    const onError = ()=>{
        alert("error in saving the pomodoro detected");
    }

    //* primo div era Pomodoro
    return(
    <div className={style.mainDiv}> 
        {/* <Help></Help> */}
        <div className={style.headerDiv} style={{display: isModing ? "none" : "contents"}}>
            <span className={style.timerDisplay}> {pomodoroTitle}</span>
            <span className={style.timerDisplay}>{minutes < 10 ? '0' + minutes : minutes} Minuti </span>
            <span className={style.timerDisplay}>{seconds < 10 ? '0' + seconds : seconds} Secondi </span>

            <div className={style.buttonsDiv} >            
                {runTimer ? 
                    <button onClick={()=>{stopTimer()}} ref={stopButtonRef} className={`${style.runButton} ${style.pomodoroButton}`}> Stop timer 
                    <Animation2 run={runTimer} resetFlag={resetFlag} currentTimer={curTimer}></Animation2> </button> : 
                    <button onClick={()=>{setRunTimer(1)}} ref={runButtonRef} disabled={disableRun} className={`${style.runButton} ${style.pomodoroButton}`}> Avvia timer 
                    <Animation2 run={runTimer} resetFlag={resetFlag} currentTimer={curTimer}></Animation2></button>}
                <button onClick={()=>{CyclesReset()}} ref={resetButtonRef} className={style.pomodoroButton}> Ricomincia ciclo </button>
                <button onClick={()=>{gotoNext()}} ref={skipButtonRef} className={style.pomodoroButton}> Salta </button>
            </div>
            <div style={{padding: "5px"}}>
                <GenOptionDisplayer optionA={StudyTime} optionB={BreakTime} optionC={cyclesLeft}></GenOptionDisplayer>    
            </div>
            
        </div>        

        <div id= "FormDiv" style={{textAlign : 'center', display: isModing ? "block" : "none"}}>
            <h2> Titolo del Pomodoro </h2>
            {titleComponent2}
            {formComponents[formType]}
            <div className={style.buttonDiv1}>
                <button onClick = {()=>{newPomodoro()}} className={style.pomodoroButton}> Ripristina</button>
                <button onClick={changeForm} ref={formatButtonRef} className={style.pomodoroButton}>Cambia Formato</button>
                <button onClick={formMethods.handleSubmit(onSubmit, onError) } ref={saveButtonRef} disabled={disableSave} className={style.pomodoroButton}> { pomodoroId ? "Aggiorna" : "Salva"} </button>
            </div>
        </div>        
        {/* <Animation currentTimer = {curTimer} studyTime = {StudyTime} breakTime = {BreakTime} run = {runTimer} resetFlag={resetFlag}/> */}

        {/* {<Animation2 run={runTimer} resetFlag={resetFlag} currentTimer={curTimer}></Animation2>} */}
        { <button className={style.pomodoroButton}
        onClick={()=>{updateModing(1 ^ isModing); }}>
        {isModing ? "Pronto allo studio!": "crea/modifica Pomodoro"}</button>}
        <div className={style.sideBar}>
            <PomodoroSideBar loadPomodoro = {loadPomodoro} deleteCallback={newPomodoro}></PomodoroSideBar>
        </div>
    </div> 
    )
}

export default Pomodoro;