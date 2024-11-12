import React, { useState, Fragment } from "react";
import OptionDisplay from "./OptionDisplay";
import {useForm} from "react-hook-form";

function TTform( {passTimeData}){

    let {register, handleSubmit, getValues} = useForm();
    //useForm ritorna un oggetto che comprende il metodo register, il quale a sua volta ritorna  un oggetto che contiene i metodi per registrare i campi del form

    //!potentially gonna break everything
    let [displayOption, updateDisplayOption] = useState(0);
    
    function optionLoader(data){
        console.log('launching TToption module with data: ', data);
        updateDisplayOption(1);
        return false;
    }

    if(!displayOption){
        return (
            <Fragment>
                <form id="studyForm" onSubmit={handleSubmit(optionLoader)}>
                    <div className="inputDiv" id="TTdiv">
                        <label htmlFor="totalTime" id="totalTimeLB"> Enter total time available</label> <br></br>
                        <input type="number" id="totalTime" name="totalTime" min="35" max="1440" value="120"  {...register("totalTime")}></input> <br></br>
                        <button type="submit" id="TToptions">See options</button> 
                    </div>
                </form>
            </Fragment>       
        );
    }else{
        return(
            <Fragment>
                <button type="submit" id="TTfullSubmit">Register Data </button>
            </Fragment>
        );
    }
}

export {TTform};


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