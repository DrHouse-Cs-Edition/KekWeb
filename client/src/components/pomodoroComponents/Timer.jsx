import {useState, useEffect, Fragment, useRef} from 'react';
import { useTimer } from 'react-timer-hook';

//*TMP for animation testing
import paper1 from "../../pages/images/paper/paperPile1.png"
import paper2 from "../../pages/images/paper/paperPile2.png"
import cat1 from "../../pages/images/cat/cat1.png"
import cat2 from "../../pages/images/cat/cat2.png"

//! for the animation, sycnh some interval on 1000ms and two frames of an animation with the timer
function SimpleTimer( {StudyTime = 0, BreakTime = 0, Cycles = 2, callbackFunction, autoStart = 0} ){   //default is studyTime, expressed in seconds
    const [minutes, setMinutes] = useState(Math.trunc(StudyTime/60%60));
    const [seconds, setSeconds] = useState(Math.trunc(StudyTime%60));
    const [runTimer, setRunTimer] = useState(autoStart);
    const [cycle, setCycle] = useState(Cycles)
    const curTimer = useRef(0);

        const timer = useEffect(()=>{
            if(runTimer){
                const pomodoroInterval = setTimeout(()=>{ 
                    if(seconds == 0){
                        if(minutes == 0){
                            if(cycle > 0){
                                if(!curTimer.current){//study timer initialization
                                    setSeconds(Math.trunc(StudyTime%60));
                                    setMinutes(Math.trunc(StudyTime/60%60));
                                } else{ //break timer
                                    setSeconds(Math.trunc(BreakTime%60));
                                    setMinutes(Math.trunc(BreakTime/60%60));
                                }
                                if(curTimer.current) {setCycle(cycle-1); console.log("-1 cycle")};

                                curTimer.current = !curTimer.current; 
                                
                                console.log("cur time is now ", curTimer.current);
                            }//else do nothing or notify end
                            clearTimeout(pomodoroInterval);
                        }else{
                            setSeconds(59);
                            setMinutes(minutes-1);
                        }
                    }else
                    setSeconds(seconds - 1);
                }, 1000);
            }
    }, [minutes, seconds, runTimer]);
      
    return(
        <Fragment>
            <div id= "timerDiv">
                <span>{minutes < 10 ? '0' + minutes : minutes} </span>
                <span>{seconds < 10 ? '0' + seconds : seconds} </span>
            </div>
            <div id="testingDiv">
                <h2> Testing buttons below </h2>
                <button onClick={()=>{setRunTimer(1)}}> run timer </button>
                <button onClick={()=>{setRunTimer(0)}}> Stop timer </button>
            </div>
        </Fragment>
    )
}

export {SimpleTimer};