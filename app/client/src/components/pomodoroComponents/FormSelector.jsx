import React, { useState, Fragment, useRef } from "react";
import {useForm} from "react-hook-form";




function CyclesForm ( {passTimeData}){

    let {register, getValues} = useForm();

    const handleFormSubmit = ()=>{
        return false;
    }

    const sendDataToParent = ()=>{
        console.log('submitting form for cycles');
        passTimeData(getValues('studyTime'), getValues('breakTime'), getValues('cycles') );
    }
        return (
        <Fragment>
            <form id="studyForm" onSubmit={handleFormSubmit}>

                <div className="inputDiv" id="cyclesDiv">

                    <label htmlFor="studyTime">Enter study time in minutes:</label> 
                    <input type="number" id="studyTime" name="studyTime" className="timeInput" min="1"  placeholder="35" {...register("studyTime")}></input> <br></br>
            
                    <label htmlFor="breakTime">Enter pause time in minutes </label> 
                    <input type="number" id="breakTime" name="breakTime" className="timeInput" min="1"  placeholder="5"  {...register("breakTime")}></input> <br></br>

                    <label htmlFor="cycles" id="cyclesLB">Enter number of cycles </label>
                    <input type="number" id="cycles" name="cycles" min="1" placeholder="5"  {...register("cycles")}></input> <br></br>

                    <button id="CycleSend" type="button" onClick={sendDataToParent}>Register Data</button>
                </div>
            </form>
        </Fragment>
        
    );
}
export {CyclesForm};

function TTform( {passTimeData}){
    
    let {register, getValues} = useForm();

    const [studyTime, setStudyTime] = useState(30); //min = 30, max = 45
    const [breakTime, setBreakTime] = useState(5);  //min = 5, max = 15
    const hasComputed = useRef(0);
    const tt = useRef(0);       //tt
    const tmpStudy = useRef(30), tmpBreak = useRef(5);

    /**
     * Function return the number of cycles that can be run with the current settings, trunc to the nearest val
     * @returns {Int}
     */
    function calcCycles (){
        return Math.floor(tt.current / (tmpStudy.current + tmpBreak.current));
    }

    const initOptions = ()=>{
        console.log('initOptions function called, normalizing tt');
        hasComputed.current = 1;
        tt.current = getValues("totalTime");
        tt.current = tt.current - (tt.current % 5);         //normalize total time to a multiple of 5 minutes
        
        while( tt.current % (tmpStudy.current + tmpBreak.current) !== 0 ){   //until we can safely provide a valid option
            if( tmpStudy.current === 45 && tmpBreak.current === 15 ){    //if max vals have been reached, return default option
                tmpStudy.current = 30 ; 
                tmpBreak.current = 5;
                console.log("FormSelector.jsx->initOptions: resorting to default option");
                break;
            }else if( tmpStudy.current === 45 ){
                tmpBreak.current += 5;
                tmpStudy.current = 30;
                console.log("FormSelector.jsx->initOptions: incrementing break time");
            }else {
                tmpStudy.current += 5;
                console.log("FormSelector.jsx->initOptions: incrementing study time");
            }
        }

        setStudyTime( tmpStudy.current );
        setBreakTime( tmpBreak.current );
    }

    const nextOption = ()=>{

        console.log('nextOption function called');
        if ( !hasComputed.current ){
            alert("Warning: insert a time value and compute the possible options first");
            return;
        }
        
        do{   //until we can safely provide a valid option
            if( tmpStudy.current === 45 && tmpBreak.current === 15 ){    //if max vals have been reached, return default option
                tmpStudy.current = 30 ; 
                tmpBreak.current = 5;
                console.log("FormSelector.jsx->nextOption: restoring initial option");
                break;
            }else if( tmpStudy.current === 45 ){
                tmpBreak.current += 5;
                tmpStudy.current = 30;
                console.log("FormSelector.jsx->nextOption: incrementing break time");
            }else {
                console.log("what the hell : ", tmpStudy.current);
                tmpStudy.current += 5;
                console.log("FormSelector.jsx->nextOption: incrementing study time");
            }
        } while( tt.current % (tmpStudy.current + tmpBreak.current) !== 0 );

        console.log("FormSelector.jsx->nextOption: set new options: ", tmpStudy.current, " ", tmpBreak.current);
        setStudyTime( tmpStudy.current );
        setBreakTime( tmpBreak.current );
    }

    const registerOptions = ()=>{
        console.log('registerOptions function called');
        if ( !hasComputed.current ){
            alert("Warning: insert a time value and compute the possible options first");
            return;
        }

        console.log("FormSelector.jsx->registerOptions: registering options; study=", studyTime, ", break=", breakTime, ", cycles=", calcCycles() );
        passTimeData(studyTime, breakTime, calcCycles());
    }



        return (
            <Fragment>
                <form id="studyForm" onSubmit={ ()=>{return false}}>
                    <div className="inputDiv" id="TTdiv">
                        <label htmlFor="totalTime" id="totalTimeLB"> Enter total time available</label> <br></br>
                        <input type="number" id="totalTime" min="35" max="1440" placeholder="120"  {...register("totalTime")}></input> <br></br>
                        <button type="button" id="TToptions" onClick={initOptions}>See options</button> 
                        <div>
                            <span> Study Time = {studyTime} </span>
                            <span> Break Time = {breakTime} </span>
                            <span> cycles = {calcCycles()} </span>
                            <button type="button" id="nextOption" onClick={nextOption}>Next Option </button>
                        </div>

                        <button type="button" id="registerOptions" onClick={registerOptions}> Register Options</button>
                    </div> 
                </form>
            </Fragment>       
        );
}

export {TTform};
