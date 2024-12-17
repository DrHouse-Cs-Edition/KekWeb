import { Fragment, useEffect, useState } from "react";

/**
 * Function linked to the TotalTime Form
 * It displays the various possible option given the minutes of available time
 * range for study is 30:60 with 5 minutes increment
 * range for break is 5:15 with 5 minutes increment
 */
function OptionDisplay({TotalMinutes = 0}){
    const [studyTime, setStudyTime] = useState(30);
    const [breakTime, setBreakTime] = useState(5);
    const [cycles, setCycles] = useState(Math.trunc(TotalMinutes / (studyTime + breakTime)));


    useEffect( ()=>{    //upon changing the total time, return to the first available option
        setStudyTime(30);
        setBreakTime(5);
        while(TotalMinutes % (studyTime + breakTime) != 0){ //until the total time is divisible, ergo a perfect cycle is possible
            setStudyTime((studyTime + 5));    //need to set it automatically to something in the range

        }
    }, [TotalMinutes])

    const next = ()=>{

    }

    return(
        <Fragment>
            <div className="optionDisplay">
                <span>studyTime</span>
                <span>breakTime</span>
                <span>studyTime</span>
            </div>
        </Fragment>
    )
}

export default OptionDisplay;