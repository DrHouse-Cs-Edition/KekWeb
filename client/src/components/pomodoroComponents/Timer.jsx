import {useState, useEffect, Fragment} from 'react';



/*
    Timer simply display a simple timer that displays minutes and seconds
    It requires a duration expressed in ms and nothing more
*/
const Timer = ( {duration} )=>{
    const [seconds, updateSeconds] = useState(0);
    const [minutes, updateMinutes] = useState(0);
    

    //the timer starts automatically once the component has been fullly rendered
    useEffect ( ()=>{
        let secondsLeft = duration;
        console.log("starting timer interval");
        let interval = setInterval(()=>{
            secondsLeft = secondsLeft -1;

            if(secondsLeft <= 0) 
                clearInterval(interval);
            console.log("cycle timer; ",secondsLeft);
    
            updateMinutes(Math.floor((secondsLeft/60)%60));
            updateSeconds(Math.floor(secondsLeft%60));
        },1000);

        return;
        //console.log("clearing interval from useEffect");        
    }, []);

    return(
        <Fragment>
            <div className="timer">
                <div id = "minutes">
                    {minutes < 10 ? "0" + minutes : minutes}
                </div>
                <div id = "seconds">
                {seconds < 10 ? "0" + seconds : seconds}
                </div>
            </div>
        </Fragment>
    );


}

export default Timer;