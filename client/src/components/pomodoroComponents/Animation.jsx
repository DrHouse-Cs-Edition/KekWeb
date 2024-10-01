
/*
    Aggiunge un listener in caso di click sul bottone per avviare l'animazione
    Deve avere i campi necessari ad avviare l'animazione già compilati. Fare riferimento alle altre funzioni
*/
function Animation() {
    console.log("kek"); //per vedere che la funzione parte
    // Previene l'invio del form, avviando invece l'animazione
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

        if(n_cycles === 0 )
            clearInterval(cycle);
        
    },cycleDuration*NotFirst);

};
