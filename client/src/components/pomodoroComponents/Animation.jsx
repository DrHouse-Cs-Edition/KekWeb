
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
                    console.log(`clearing pause interval`);
                    clearInterval(pauseInterval);
                    document.getElementById(`timerDisplay`).textContent = `00:00`;
                }
            }, 1000)
        },studyTime*60000);
        n_cycles --;

        if(n_cycles === 0 )
            clearInterval(cycle);
        
    },cycleDuration*NotFirst);

};


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