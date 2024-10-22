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
                        <input type="number" id="totalTime" name="totalTime" min="35" max="1440" value="120" onBlur="FVBV(id, min,max)" {...register("totalTime")}></input> <br></br>
                        <button type="submit" id="TToptions">See options</button> 
                    </div>
                </form>
            </Fragment>       
        );
    }else{
        return(
            <Fragment>
                <button type="submit" id="TTfullSubmit">Start Studying </button>
            </Fragment>
        );
    }
}

export {TTform};


function CyclesForm ( {passTimeData}){

    let {register, handleSubmit, getValues} = useForm();

    function handleFormSubmit (){
        console.log('submitting form for cycles');
        console.log("study time from CyclesForm", getValues("studyTime"));
        passTimeData(getValues('studyTime'), getValues('breakTime'), getValues('cycles') );
        return false;
    }
//
        return (
        <Fragment>
            <form id="studyForm" onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="inputDiv" id="cyclesDiv">

                    <label htmlFor="studyTime">Enter study time in minutes:</label> 
                    <input type="number" id="studyTime" name="studyTime" className="timeInput" min="1"  placeholder="35" onBlur="FVBV(id, min)" {...register("studyTime")}></input> <br></br>
            
                    <label htmlFor="breakTime">Enter pause time in minutes </label> 
                    <input type="number" id="breakTime" name="breakTime" className="timeInput" min="1"  placeholder="5" onBlur="FVBV(id, min)" {...register("breakTime")}></input> <br></br>

                    <label htmlFor="cycles" id="cyclesLB">Enter number of cycles </label>
                    <input type="number" id="cycles" name="cycles" min="1" placeholder="5" onBlur="FVBV(id, min)" {...register("cycles")}></input> <br></br>

                    <button type="submit" id="fullSubmit">Start Studying</button>
                </div>
            </form>
        </Fragment>
        
    );
}

export {CyclesForm};


/*  function checks that the value of a field upon loss of focus is within of the min and max value. Can be called
    regardless of actual automatic HTML verification, to directly set a value equal to the closest bound (min or max)
*/
function FVBV(fieldID, min, max){
    let el = document.getElementById(String(fieldID));
    console.log(`id recieved is ${fieldID}, min is ${min}, max is ${max}`);

    if( max && parseInt(el.value) > parseInt(max)){
        console.log(`value is  ${el.value} of type ${typeof(el.value)} substituted for max `);
        el.value = max;
        console.log(`value is now ${document.getElementById(String(fieldID)).value} `); 
    }else if( min && parseInt(el.value) < parseInt(min)){
        console.log(`value is  ${el.value} substituted for max `);
        el.value = min;
        console.log(`value is now ${document.getElementById(String(fieldID)).value} `); 
    }
}