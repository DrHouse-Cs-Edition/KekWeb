import React, { useState, Fragment, useRef } from "react";
import {FormProvider, useForm} from "react-hook-form";
import {Input} from "../../utils/Input"  // elemento di input customizzabile che richiede label, type, id, placeholder, validationMessage, min, max, maxLenght, minLenght




function CyclesForm ( {passTimeData}, isNewPomodoro) {


    let formMethods = useForm();

    const onSubmit = ( data =>{
        passTimeData(data.studyTime, data.breakTime, data.cycles );
        return false;
    })

    const onError = () =>{
        console.log("an error has been detected");
    }

        return (
        <Fragment>
            <FormProvider {...formMethods}>
            <form 
            onSubmit={e  => e.preventDefault()}
            noValidate 
            >
                <div className="inputDiv" id="cyclesDiv">
                    <Input 
                    label = {"studyTime"}
                    type = "number"
                    id = "studyTimeField"
                    placeholder={"45"}
                    validationMessage={"insert a study time between 30 and 45 minutes"}
                    min = {30}
                    max = {45}
                    isRequired = {0}
                    >
                    </Input>

                    <Input 
                    label = {"breakTime"}
                    type = "number"
                    id = "breakTimeField"
                    placeholder={"15"}
                    validationMessage={"insert a break time between 5 and 15 minutes"}
                    max = {15}
                    min = {5}
                    isRequired = {0}
                    >
                    </Input>

                    <Input 
                    label = {"cycles"}
                    type = "number"
                    id = "cyclesField"
                    placeholder={"4"}
                    validationMessage={"insert the number of cycles"}
                    min={1}
                    max = {24}
                    isRequired = {0}
                    >
                    </Input>

                    <button id="CycleSend" type="button" onClick={formMethods.handleSubmit(onSubmit, onError)}>Save settings</button>
                </div>
            </form>
            </FormProvider>
        </Fragment>
    );
}
export {CyclesForm};

function TTform( {passTimeData}, isNewPomodoro){

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

    /**
     * function that takes the processed data from the form as input and selects the first values for studyTime, breakTime and cycles
     * values are stored in the state variables above (study and break) or calculated (cycles)
     * @param {data} data object 
     */
    function initOptions(data){
        hasComputed.current = 1;    //makes certain actions now possible, given that they required the computation of the time first
        tt.current = data.TotalTime;
        tt.current = tt.current - (tt.current % 5);                             //normalize total time to a multiple of 5 minutes
        
        while( tt.current % (tmpStudy.current + tmpBreak.current) !== 0 ){      //until we can safely provide a valid option
            if( tmpStudy.current === 45 && tmpBreak.current === 15 ){           //if max vals have been reached, return default option
                tmpStudy.current = 30 ; 
                tmpBreak.current = 5;
                break;
            }else if( tmpStudy.current === 45 ){                                //max study reached, increment break and start over with study
                tmpBreak.current += 5;
                tmpStudy.current = 30;
            }else {                                                             //increment study time 
                tmpStudy.current += 5;
            }
        }
        setStudyTime( tmpStudy.current );
        setBreakTime( tmpBreak.current );
    }

    /**
     * IT
     * Presupposto di aver calcolato in precedenza i valori temporali tramite la funzione initOptions, si passa al prossimo valore possibile
     * 
     * ENG
     * Given that the temporal values have been previously calculated through the initOptions function, we move to the next possible value
     * @returns void
     */
    const nextOption = ()=>{
        if ( !hasComputed.current ){
            alert("Warning: insert a time value and compute the possible options first");
            return;}
        
        do{   //until we can safely provide a valid option
            if( tmpStudy.current === 45 && tmpBreak.current === 15 ){    //if max vals have been reached, return default option
                tmpStudy.current = 30 ; 
                tmpBreak.current = 5; 
                break;
            }else if( tmpStudy.current === 45 ){
                tmpBreak.current += 5;
                tmpStudy.current = 30;     
            }else {      
                tmpStudy.current += 5;  
            }
        } while( tt.current % (tmpStudy.current + tmpBreak.current) !== 0 );

        setStudyTime( tmpStudy.current );
        setBreakTime( tmpBreak.current );
    }

    const TThandleSubmit = (data)=>{
        if ( !hasComputed.current ){
            alert("Warning: insert a time value and compute the possible options first");
            return;
        }
        
        passTimeData(studyTime, breakTime, calcCycles());
    }

    const TThandleError = ()=>{
        
    }

    const TTformMethods = useForm()
        return (
            <Fragment>
                <FormProvider {...TTformMethods}>
                <form 
                onSubmit={e  => e.preventDefault()}
                noValidate 
                >
                    <div className="inputDiv" id="TTdiv">
                        <Input 
                        label = {"TotalTime"}
                        type = "Number"
                        id = "studyTimeField"
                        placeholder={"120"}
                        validationMessage={"insert a total time thats more than 0"}
                        min = {0}
                        max = {1440}
                        isRequired = {isNewPomodoro}
                        >
                        </Input> <br/>

                        <button type="button" id="TToptions" onClick={TTformMethods.handleSubmit(
                            (data) => { //onSubmit 
                                initOptions(data);
                            }
                        , () => {   //onError                
                        })}>See options</button>
                        
                        <div>
                            <span> Study Time = {studyTime} </span>
                            <span> Break Time = {breakTime} </span>
                            <span> cycles = {calcCycles()} </span>
                            <button type="button" id="nextOption" onClick={nextOption}>Next Option </button>
                        </div>

                        <button type="button" id="registerOptions" onClick={TTformMethods.handleSubmit(TThandleSubmit, TThandleError)}> Register Options</button>
                    </div> 
                </form>
                </FormProvider>
            </Fragment>       
        );
}

export {TTform};
