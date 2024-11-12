
function OptionDisplay(){

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
}

export default OptionDisplay;