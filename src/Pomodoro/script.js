

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

    document.getElementById(`TTbox`).style.setProperty(`display`,`flex`);

    //TODO: select option and store it's values
});


/*

    Aggiunge un listener in caso di click sul bottone per avviare l'animazione
    Deve avere i campi necessari ad avviare l'animazione già compilati. Fare riferimento alle altre funzioni
*/
document.getElementById('fullSubmit').addEventListener('click', function (event) {
    console.log("kek"); //per vedere che la funzione parte
    // Previene l'invio del form, avviando invece l'animazione
    event.preventDefault()
    let studyTime = document.getElementById("studyTime").value;
    let pauseTime = document.getElementById("pausinaTime").value;
    let n_cycles = document.getElementById("cycles").value;



    // Calcola il tempo di fine aggiungendo la durata del timer al tempo corrente
    const startTime = Date.now();
    const endTime = startTime + studyTime * 60000;

    // Imposta un intervallo che si ripete ogni secondo
    const interval = setInterval(function () {
        const now = Date.now();
        const elapsedPercentage = timeElapsed(startTime, endTime, now);

        // Aggiorna l'immagine in base alla percentuale trascorsa
        let imgPaper = document.getElementById("paperPile");
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

        // Calcola la differenza tra il tempo di fine e il tempo corrente
        const difference = endTime - now;

        // Se la differenza è minore o uguale a 0, ferma l'intervallo
        if (difference <= 0) {
            clearInterval(interval);
            // Pulisce il testo dell'elemento con id 'timerDisplay'
            document.getElementById('timerDisplay').textContent = "";
            return;
        }

        // Calcola i minuti e i secondi rimanenti
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Visualizza il tempo rimanente nell'elemento con id 'timerDisplay'
        //padstart aggiunge uno zero prima della stringa se non raggiunge almeno una lunghezza di 2
        document.getElementById('timerDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
});

/*
* function that returns the amount of time that has passed since the beginning
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
    function that fills the fields for number of cycles, study duration and pause duration
    it servers the purpouse of determining animation-related info and actuale timer data
    it differentiates based on the format chosen by the user
*/


function time(event) {
    print("user has written something");
};


function updateFormat(){
    let isCycles = document.getElementById("cyclesButton").checked;
    if(isCycles)
    {
        //changing buttons
        console.log("cycles");
        document.getElementById("cycles").style.setProperty('display', 'inline-block');
        document.getElementById("totalTime").style.setProperty('display', 'none');
        document.getElementById('fullSubmit').style.setProperty('display', 'inline-block');
        document.getElementById("TToptions").style.setProperty('display', 'none');

        //changing instructions
        console.log("instructions changed");
        document.getElementById("cyclesLB").style.setProperty('display', "inline-block" );
        document.getElementById("totalTimeLB").style.setProperty('display', "none");
    }else{

        //changing buttons
        console.log("time");
        document.getElementById("cycles").style.setProperty('display', 'none');
        document.getElementById("totalTime").style.setProperty('display', 'inline-block');
        document.getElementById('fullSubmit').style.setProperty('display', 'none');
        document.getElementById('TToptions').style.setProperty('display', 'inline-block');

        //changing instructions
        console.log("instructions changed");
        document.getElementById("cyclesLB").style.setProperty('display', "none" );
        document.getElementById("totalTimeLB").style.setProperty('display', "inline-block");
    }
}