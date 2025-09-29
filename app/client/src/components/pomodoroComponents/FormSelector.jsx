import React, { useState, Fragment, useRef } from "react";
import {FormProvider, useForm} from "react-hook-form";
import {Input} from "../../utils/Input"  // elemento di input customizzabile che richiede label, type, id, placeholder, validationMessage, min, max, maxLenght, minLenght
import style from "./FormSelector.module.css"



function CyclesForm ( {passTimeData}, isNewPomodoro) {
    let formMethods = useForm();

    const onSubmit = ( data =>{
        let st, bt, c;
        st = data.Studio;
        bt =  data.Pausa;
        c = data.Cicli;
        if( !(c || bt || st) ){
            console.log("no data for registration somewhere")
        }
        passTimeData(data.Studio, data.Pausa, data.Cicli );   //multiplication by 60 transforms seconds in minutes
        alert("Impostazione selezionata: è possibile avviare il pomodoro")
        return false;
    })

    const onError = (e) =>{
        alert("Error with the form")
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
                    label = {"Studio"}
                    type = "number"
                    id = "studyTimeField"
                    defaultValue={"45"}
                    validationMessage={"Inserisci una durata tra i 15 ed i 60 minuti"}
                    min = {15}
                    max = {60}
                    isRequired = {0}
                    >
                    </Input>

                    <Input 
                    label = {"Pausa"}
                    type = "number"
                    id = "breakTimeField"
                    defaultValue={"15"}
                    validationMessage={"Inserisci una durata tra i 5 ed i 30 minuti"}
                    max = {30}
                    min = {5}
                    isRequired = {0}
                    >
                    </Input>

                    <Input 
                    label = {"Cicli"}
                    type = "number"
                    id = "cyclesField"
                    defaultValue={"4"}
                    validationMessage={"Inserisci il numero di cicli"}
                    min={1}
                    max = {24}
                    isRequired = {0}
                    >
                    </Input>

                    <button className={[style.CycleSend, style.formButton].join("")} type="button" onClick={formMethods.handleSubmit(onSubmit, onError)}>Scegli questa Impostazione</button>
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
    const tmpStudy = useRef(15), tmpBreak = useRef(5);

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
        tt.current = data.Tempo;
        tt.current = tt.current - (tt.current % 5);                             //normalize total time to a multiple of 5 minutes
        
        while( tt.current % (tmpStudy.current + tmpBreak.current) !== 0 ){      //until we can safely provide a valid option
            if( tmpStudy.current === 60 && tmpBreak.current === 30 ){           //if max vals have been reached, return default option
                tmpStudy.current = 15 ; 
                tmpBreak.current = 5;
                break;
            }else if( tmpStudy.current === 60 ){                                //max study reached, increment break and start over with study
                tmpBreak.current += 5;
                tmpStudy.current = 15;
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
            alert("Attenzione: inserire prima una durata e cliccare su \" vedi opzioni \"");
            return;
        }
        
        do{   //until we can safely provide a valid option
            if( tmpStudy.current === 60 && tmpBreak.current === 30 ){    //if max vals have been reached, return default option
                tmpStudy.current = 15 ; 
                tmpBreak.current = 5; 
                break;
            }else if( tmpStudy.current === 60 ){
                tmpBreak.current += 5;
                tmpStudy.current = 15;     
            }else {      
                tmpStudy.current += 5;  
            }
        } while( tt.current % (tmpStudy.current + tmpBreak.current) !== 0 );
        setStudyTime( tmpStudy.current );
        setBreakTime( tmpBreak.current );
        if ( !hasComputed.current ){
            alert("Attenzione: inserire prima una durata e cliccare su \" vedi opzioni \" ");
            return;
        }
        passTimeData(tmpStudy.current, tmpBreak.current, calcCycles());
    }

    
    const TThandleSubmit = (data)=>{
        alert("opzione selezionata: è possibile usare il pomodoro")
        if ( !hasComputed.current ){
            alert("Attenzione: inserire prima una durata e cliccare su \" vedi opzioni \" ");
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
                        label = {"Tempo"}
                        type = "Number"
                        id = "studyTimeField"
                        defaultValue={"120"}
                        validationMessage={"Inserire un valore valido (60 to 1440)"}
                        min = {30}
                        max = {1440}
                        isRequired = {isNewPomodoro}
                        >
                        </Input>

                        { !hasComputed.current ? 
                            <button type="button" className={[style.TToptions, style.formButton].join("")} onClick={TTformMethods.handleSubmit(
                                (data) => { //onSubmit 
                                    initOptions(data);
                                }
                            , () => {   //onError                
                            })}>Vedi opzione</button> : 
                            <button type="button" className={[style.nextOption, style.formButton].join("")} onClick={nextOption}>Prossima opzione </button>}
                        
                        <div style={{marginTop: "5px"}}>
                            <span> Durata studio = {studyTime} </span>
                            <span> Durata pausa = {breakTime} </span>
                            <span> Cicli = {calcCycles()} </span>
                            
                        </div>

                        <button type="button" className={[style.registrationOptions, style.formButton].join("")} onClick={TTformMethods.handleSubmit(TThandleSubmit, TThandleError)}> Scegli questa Impostazione</button>
                    </div> 
                </form>
                </FormProvider>
            </Fragment>       
        );
}

export {TTform};
