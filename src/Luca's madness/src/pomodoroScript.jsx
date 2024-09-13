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


function formSelector (){

    let [formType, formTypeUpdater] = useState(0);

    if(formType)
    {
        return (
        <Fragment>
            <form id="studyForm">
                <div class="inputDiv" id="TTdiv">
                    <button onClick={formTypeUpdater(false)}>Cycles Format</button>
                    <label for="totalTime" id="totalTimeLB"> Enter total time available</label> <br></br>
                    <input type="number" id="totalTime" name="totalTime" min="35" max="1440" value="120" onblur="FVBV(id, min,max)"></input> <br></br>
                    <button type="submit" id="TToptions">See options</button> <br></br>
                    <button display= "none" type="submit" id="TTfullSubmit">Start Studying </button> <br></br>
                </div>
            </form>
        </Fragment>
            
        );
    }else{
        return (
        <Fragment>
            <form>
                <div class="inputDiv" id="cyclesDiv">
                    <button onClick={formTypeUpdater(true)}></button>

                    <label for="studyTime">Enter study time in minutes:</label> 
                    <input type="number" id="studyTime" name="studyTime" class="timeInput" min="1"  placeholder="35" onblur="FVBV(id, min)"></input> <br></br>
            
                    <label for="pausinaTime">Enter pause time in minutes </label> 
                    <input type="number" id="pausinaTime" name="pausinaTime" class="timeInput" min="1"  placeholder="5" onblur="FVBV(id, min)"></input> <br></br>

                    <label for="cycles" id="cyclesLB">Enter number of cycles </label>
                    <input type="number" id="cycles" name="cycles" min="1" placeholder="5" onblur="FVBV(id, min)"></input> <br></br>

                    <button type="submit" id="fullSubmit">Start Studying</button>
                </div>
            </form>
        </Fragment>
        
    );
    }
}

export default formSelector;




/*
    function called upon inserting and confirming the total number of minutes
    It displays a serie of possible arrangments for the study cycle to choose from
    The chosen option, upon confirmation, will be used for the timer
    Disposition of the option is dynamical and calculated each time.
    The div it refers to is invisible until needed.
*/
document.getElementById('TToptions').addEventListener('click', function (event){
    event.preventDefault(); //stop the form from sending data

    // compute time factor
    //!status: waiting validation
    /*
    * in order to calculate time, we need to discern the format used to communicate it
    * after selecting format, take data and calculate time
    */

    let optionsArray = [];  //array where any possible option is stored
    let tmpTotalTime = document.getElementById("totalTime").value;
    console.log(`total time registered: ${tmpTotalTime}`);

    let debugOptionCount = 0; //value used to print added option in the log

    //calculation is based on the hypotesis that cycles are composed of 1 study phase and 1 rest phase, repeated on a loop
    //rest phase must be shorter than study phase. Study phase ranges between 30-60 mins, rest phase 5-30 mins
    //* additional parameter might be the ration of study or pause in a cycle compared to total time

    tmpTotalTime =  tmpTotalTime - (tmpTotalTime % 5); //round the number by defect to a multiple of 5 (garantee no exceeding limit)
    for( let i = 5; i <= 30 ;i = i+5){  //pause time for
        for(let j = 30; j <= 60; j = j + 5 )    //study time for
        {
            if( i <= j) //if for option admission: is this acceptable? (*for future filter*)
            {
                if(tmpTotalTime % (i+j) == 0)   //single cycle of correct measure (can it be repeated to precise mesure?)
                {
                    //here we add the option to the array
                    let tmp = {
                        pause : i,
                        study : j,
                        cycles : tmpTotalTime / (i+j),
                        totalTime : tmpTotalTime
                    };
                    optionsArray.push(tmp);      //a new option is added  
                    
                    //*debug code
                    console.log(`new possible timeFormat added: cycles: ${optionsArray[debugOptionCount].cycles},
                        study time: ${optionsArray[debugOptionCount].study},
                        rest time: ${optionsArray[debugOptionCount].pause} `);
                    debugOptionCount ++;                
                }
            }
        }
    }

    // display options
    //!status: waiting validation
    let counter = 0; //counter for moving through the array
    let TTdiv = document.getElementById("TTbox");
    console.log(`array length is ${optionsArray.length}`);
    for( let i = 0; i < optionsArray.length; i = i + 1){    //traverse the option array
        let option = document.createElement(`input`);
        option.type="radio";
        option.name="formatOption";
        option.value = `${i}`;
        option.id = `TToption${i+1}`;

        let optionLabel = document.createElement(`label`);
        optionLabel.id = `TTlabel${i+1}`;
        optionLabel.htmlFor = `TToption${i+1}`;
        optionLabel.innerHTML =`Study time: ${optionsArray[i].study}min, 
        Rest time: ${optionsArray[i].pause}min, 
        Cycles: ${optionsArray[i].cycles} </radio>`;
        // TTdiv.innerHTML=`<input type="radio" name="formatOption" id="TToption${i+1}">
        // Study time: ${optionsArray[i].study}min, 
        // Rest time: ${optionsArray[i].pause}min, 
        // Cycles: ${optionsArray[i].cycles} </radio>
        // `;

        TTdiv.appendChild(option);
        TTdiv.appendChild(optionLabel);
        TTdiv.appendChild(document.createElement(`br`));
        console.log(`added option: ${i}`);
    }

    document.getElementById(`TTbox`).style.setProperty(`display`,`inline-block`);

    //TODO: select option and store it's values
});


/*
    Aggiunge un listener in caso di click sul bottone per avviare l'animazione
    Deve avere i campi necessari ad avviare l'animazione già compilati. Fare riferimento alle altre funzioni
*/
document.getElementById('fullSubmit').addEventListener('click', function (event) {
    console.log("kek"); //per vedere che la funzione parte
    // Previene l'invio del form, avviando invece l'animazione
    event.preventDefault();
    let studyTime = document.getElementById("studyTime").value;
    let pauseTime = document.getElementById("pausinaTime").value;
    let n_cycles = document.getElementById("cycles").value;
    let cycleDuration = (studyTime + pauseTime) * 60000; //*1000 per esprimere in millisec, *60 perchè sto misurando in secondi
    //tempo di attesa perchè termini un singolo ciclo

    //!cicla i cicli (si è un casino)

    let NotFirst = 0;

    let cycle = setInterval( () => {
        NotFirst = 1;
        console.log("oh that's not good");
        //*study loop
        let studyStart = Date.now();
        let studyEnd = studyStart + studyTime*60000;
        let studyInterval = setInterval(() => {
            let stopStudy = studyCycle(studyStart, studyEnd);
            if(stopStudy)
            {
                console.log("clearing study interval");
                clearInterval(studyInterval);
                // Pulisce il testo dell'elemento con id 'timerDisplay'
                document.getElementById('timerDisplay').textContent = "00:00";
            }
        },1000);

        //* pause loop
        let pauseStart = studyEnd;
        let pauseEnd = pauseStart + pauseTime*60000;
        setTimeout( () =>{
            let pauseInterval = setInterval(() =>{
                let endPause = pauseCycle(pauseStart, pauseEnd);
                if(endPause){
                    console.log(`clearting pause interval`);
                    clearInterval(pauseInterval);
                    document.getElementById(`timerDisplay`).textContent = `00:00`;
                }
            }, 1000)
        },studyTime*60000+500);
        n_cycles --;

        if(n_cycles == 0 )
            clearInterval(cycle);
        
    },cycleDuration*NotFirst);

});

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

function updateFormat(){
    let isCycles = document.getElementById("cyclesButton").checked;
    if(isCycles)
    {
        document.getElementById('cyclesDiv').style.setProperty('display','inline-block');
        document.getElementById("TTdiv").style.setProperty('display','none');
    }else{
        document.getElementById('cyclesDiv').style.setProperty('display','none');
        document.getElementById('TTdiv').style.setProperty('display','inline-block');
    }
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