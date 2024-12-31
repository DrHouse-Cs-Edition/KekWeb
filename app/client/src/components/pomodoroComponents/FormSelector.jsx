import React, { useState, Fragment, useRef } from "react";
import {FormProvider, useForm} from "react-hook-form";
import {Input} from "../utils/Input.jsx"  // elemento di input customizzabile che richiede label, type, id, placeholder, validationMessage, min, max, maxLenght, minLenght




function CyclesForm ( {passTimeData}){

    let formMethods = useForm();

    const onSubmit = ( data =>{
        console.log('submitting form for cycles with study = ', data.studyTime, ", break ", data.breakTime, ", cycles ",data.cycles);
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
                    max = {45}>
                    </Input> <br/>

                    <Input 
                    label = {"breakTime"}
                    type = "number"
                    id = "breakTimeField"
                    placeholder={"15"}
                    validationMessage={"insert a break time between 5 and 15 minutes"}
                    max = {15}
                    min = {5}>
                    </Input> <br/>

                    <Input 
                    label = {"cycles"}
                    type = "number"
                    id = "cyclesField"
                    placeholder={"4"}
                    validationMessage={"insert the number of cycles"}
                    min={1}
                    max = {24}>
                    </Input> <br/>

                    <button id="CycleSend" type="button" onClick={formMethods.handleSubmit(onSubmit, onError)}>Register Data</button>
                </div>
            </form>
            </FormProvider>
        </Fragment>
    );
}
export {CyclesForm};

function TTform( {passTimeData}){

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
     * IT
     * funzione che prende in input i dati elaborati dal form e seleziona i primi valori per studyTime, breakTime e cicli
     * i valori sono salvati negli stati qui sopra (study e break) o calcolati (cycles)
     * 
     * ENG
     * function that takes the processed data from the form as input and selects the first values for studyTime, breakTime and cycles
     * values are stored in the state variables above (study and break) or calculated (cycles)
     * @param {data} data object 
     */
    function initOptions(data){
        console.log('initOptions function called, normalizing tt');
        hasComputed.current = 1;    //makes certain actions now possible, given that they required the computation of the time first
        tt.current = data.TotalTime;
        tt.current = tt.current - (tt.current % 5);                             //normalize total time to a multiple of 5 minutes
        
        while( tt.current % (tmpStudy.current + tmpBreak.current) !== 0 ){      //until we can safely provide a valid option
            if( tmpStudy.current === 45 && tmpBreak.current === 15 ){           //if max vals have been reached, return default option
                tmpStudy.current = 30 ; 
                tmpBreak.current = 5;
                console.log("FormSelector.jsx->initOptions: resorting to default option");
                break;
            }else if( tmpStudy.current === 45 ){                                //max study reached, increment break and start over with study
                tmpBreak.current += 5;
                tmpStudy.current = 30;
                console.log("FormSelector.jsx->initOptions: incrementing break time");
            }else {                                                             //increment study time 
                tmpStudy.current += 5;
                console.log("FormSelector.jsx->initOptions: incrementing study time");
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
        console.log('nextOption function called');
        if ( !hasComputed.current ){
            alert("Warning: insert a time value and compute the possible options first");
            return;}
        
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

    const TThandleSubmit = (data)=>{
        console.log('registerOptions function called');
        if ( !hasComputed.current ){
            alert("Warning: insert a time value and compute the possible options first");
            return;
        }
        console.log("FormSelector.jsx->registerOptions: registering options; study=", studyTime, ", break=", breakTime, ", cycles=", calcCycles() );
        passTimeData(studyTime, breakTime, calcCycles());
    }

    const TThandleError = ()=>{
        console.log('TThandleError function called')
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
                        max = {1440}>
                        </Input> <br/>

                        <button type="button" id="TToptions" onClick={TTformMethods.handleSubmit(
                            (data) => { //onSubmit
                                console.log("see option called with data ", data.TotalTime);
                                initOptions(data);
                            }
                        , () => {   //onError
                            console.log("see option returned error")
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
