import {useState, useEffect, Fragment} from 'react';
import { useTimer } from 'react-timer-hook';

//*TMP for animation testing
import paper1 from "../../pages/images/paper/paperPile1.png"
import paper2 from "../../pages/images/paper/paperPile2.png"
import cat1 from "../../pages/images/cat/cat1.png"
import cat2 from "../../pages/images/cat/cat2.png"

//! for the animation, sycnh some interval on 1000ms and two frames of an animation with the timer
const SimpleTimer = ( {StudyTime, BreakTime, callbackFunction} )=>{
    let timeFrame = {
        0 : StudyTime,
        1 : BreakTime
    }

    let [x, setX] = useState(0);    //variable used to alternate between the two timers

    let date = new Date();
    const {
        totalSeconds,
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,  
        pause,  //locally implemented in the component
        resume, //locally implemented in the component
        restart, //locally implemented in the component with the addition of a button that first resets the time values, and then restarts
        //*autostart is irrelevant since the update on the x var calls useEffect
      } = useTimer({expiryTimestamp : date.setSeconds( date.getSeconds() + timeFrame[0]), onExpire : ()=>{console.log("restarting timer with x = ", !x);
        if(x) //if x === 1 then a break cycle has ended, need to sub cycles in Pomodoro
            callbackFunction(); //*to be tested
        setX(Math.abs(x-1));
      } } );

      useEffect(()=>{
        let restartDate = new Date();
        restart(restartDate.setSeconds(restartDate.getSeconds() + timeFrame[x]));
      }, [x]);
      
    return(
        <Fragment>
            <div>
                <span>{minutes < 10 ? '0' + minutes : minutes} </span>
                <span>{seconds < 10 ? '0' + seconds : seconds} </span>
            </div>
            <div id="AnimationDiv">
                
            </div>
        </Fragment>
    )
}

export {SimpleTimer};