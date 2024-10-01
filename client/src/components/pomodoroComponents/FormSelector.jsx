//*FUNCTIONS LIST IN FILE
/*
    TToption submit event: for the TotalTime format, calculates the options and shows them. Still needs to recieve the choice
    fullSubmit submit event: starts the animation (to be reworked)
    timeElapsed: calculates time passed (to be reworked)
    updateFormat: changes the divs for the two format for time input
    FVBV (field value bounds verification): verifies that a value inserted in a field is in the specified bounds, and sets them to the upper (if overflow) or lower (if underflow) bound
*/

//  

import React, { useState } from "react";
import { Fragment } from "react";
import { motion } from "framer-motion";
import OptionDisplay from "./OptionDisplay";

function TTform(){
    
    function optionLoader(e){
        e.preventDefault();
        console.log('launching TToption module');
        
    }

    return (
        <Fragment>
            <form id="studyForm">
                <div className="inputDiv" id="TTdiv">

                    <label for="totalTime" id="totalTimeLB"> Enter total time available</label> <br></br>
                    <input type="number" id="totalTime" name="totalTime" min="35" max="1440" value="120"onBlur="FVBV(id, min,max)"></input> <br></br>

                    <button type="submit" id="TToptions" onClick={optionLoader}>See options</button> <br></br> 
                    
                    <button display= "none" type="submit" id="TTfullSubmit">Start Studying </button> <br></br>
                </div>
            </form>
        </Fragment>       
        );
}

export {TTform};


function CyclesForm (){
        return (
        <Fragment>
            <form id="studyForm">
                <div className="inputDiv" id="cyclesDiv">
                    

                    <label htmlFor="studyTime">Enter study time in minutes:</label> 
                    <input type="number" id="studyTime" name="studyTime" className="timeInput" min="1"  placeholder="35" onBlur="FVBV(id, min)"></input> <br></br>
            
                    <label htmlFor="pausinaTime">Enter pause time in minutes </label> 
                    <input type="number" id="pausinaTime" name="pausinaTime" className="timeInput" min="1"  placeholder="5" onBlur="FVBV(id, min)"></input> <br></br>

                    <label htmlFor="cycles" id="cyclesLB">Enter number of cycles </label>
                    <input type="number" id="cycles" name="cycles" min="1" placeholder="5" onBlur="FVBV(id, min)"></input> <br></br>

                    <button type="submit" id="fullSubmit">Start Studying</button>
                </div>
            </form>
        </Fragment>
        
    );
}

export {CyclesForm};




/*
    function called upon inserting and confirming the total number of minutes
    It displays a serie of possible arrangments for the study cycle to choose from
    The chosen option, upon confirmation, will be used for the timer
    Disposition of the option is dynamical and calculated each time.
    The div it refers to is invisible until needed.
*/


function studyCycle(studyStart, studyEnd){
    console.log('starting study time interval');
    let now = Date.now();
    let elapsedPercentage = timeElapsed(studyStart, studyEnd, now);
    // console.log(`elapsed percentage is ${elapsedPercentage}`);
    // Aggiorna l'immagine in base alla percentuale trascorsa
    let imgPaper = document.getElementById("imageSpace");
    if (elapsedPercentage >= 100) {
        imgPaper.style.display = "none"; // Nascondi l'immagine quando la percentuale è 100
    } else {
        imgPaper.style.display = "block"; // Mostra l'immagine quando la percentuale è inferiore a 100

        if (elapsedPercentage >= 80) {
            imgPaper.src = "./images/paper/paperPile5.png";
        } else if (elapsedPercentage >= 60) {
            imgPaper.src = "./images/paper/paperPile4.png";
        } else if (elapsedPercentage >= 40) {
            imgPaper.src = "./images/paper/paperPile3.png";
        } else if (elapsedPercentage >= 20) {
            imgPaper.src = "./images/paper/paperPile2.png";
        } else {
            imgPaper.src = "./images/paper/paperPile1.png";
        }
    }
    // console.log(`succesfully checked for image`);

    // Calcola la differenza tra il tempo di fine e il tempo corrente
    const difference = studyEnd - now;

    // Se la differenza è minore o uguale a 0, ferma l'intervallo
    if (difference <= 0) {
        return 1;
    }

    // Calcola i minuti e i secondi rimanenti
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Visualizza il tempo rimanente nell'elemento con id 'timerDisplay'
    //padstart aggiunge uno zero prima della stringa se non raggiunge almeno una lunghezza di 2
    // console.log(`updating timer...`);
    document.getElementById('timerDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    // console.log(`complete`);
}  

function pauseCycle(pauseStart, pauseEnd){
    console.log('starting pause time timer');
    let now = Date.now();
    let elapsedPercentage = timeElapsed(pauseStart, pauseEnd, now);

    let imgCat = document.getElementById('imageSpace');

    if (elapsedPercentage >= 100) {
        imgCat.style.display = "none"; // Nascondi l'immagine quando la percentuale è 100
    } else {
        imgCat.style.display = "block"; // Mostra l'immagine quando la percentuale è inferiore a 100
    }

    if (elapsedPercentage >= 75) {
        imgCat.src = "./images/cat/cat4.png";
    } else if (elapsedPercentage >= 50) {
        imgCat.src = "./images/cat/cat3.png";
    } else if (elapsedPercentage >= 25) {
        imgCat.src = "./images/cat/cat2.png";
    }else {
        imgCat.src = "./images/cat/cat1.png";
    }

    let difference = pauseEnd - now;
    if( difference <= 0){
        return 1;
    }

    // Calcola i minuti e i secondi rimanenti
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Visualizza il tempo rimanente nell'elemento con id 'timerDisplay'
    //padstart aggiunge uno zero prima della stringa se non raggiunge almeno una lunghezza di 2
    document.getElementById('timerDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/*
 function that returns the amount of time that has passed since the beginning
*/
function timeElapsed(startTime, endTime, currentTime) {
    // Calcola il tempo totale e il tempo trascorso
    const totalTime = endTime - startTime;
    const timePassed = currentTime - startTime;

    // Calcola la percentuale del tempo trascorso
    const percentagePassed = (timePassed / totalTime) * 100;

    return percentagePassed;
}

/* 
    function checks that the value of a field upon loss of focus is within of the min and max value. Can be called
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

// function updateFormat(){
//     let isCycles = document.getElementById("cyclesButton").checked;
//     if(isCycles)
//     {
//         //changing buttons
//         console.log("cycles");
//         document.getElementById("cycles").style.setProperty('display', 'inline-block');
//         document.getElementById("totalTime").style.setProperty('display', 'none');
//         document.getElementById('fullSubmit').style.setProperty('display', 'inline-block');
//         document.getElementById("TToptions").style.setProperty('display', 'none');

//         //changing instructions
//         console.log("instructions changed");
//         document.getElementById("cyclesLB").style.setProperty('display', "inline-block" );
//         document.getElementById("totalTimeLB").style.setProperty('display', "none");
//     }else{

//         //changing buttons
//         console.log("time");
//         document.getElementById("cycles").style.setProperty('display', 'none');
//         document.getElementById("totalTime").style.setProperty('display', 'inline-block');
//         document.getElementById('fullSubmit').style.setProperty('display', 'none');
//         document.getElementById('TToptions').style.setProperty('display', 'inline-block');

//         //changing instructions
//         console.log("instructions changed");
//         document.getElementById("cyclesLB").style.setProperty('display', "none" );
//         document.getElementById("totalTimeLB").style.setProperty('display', "inline-block");
//     }
// }