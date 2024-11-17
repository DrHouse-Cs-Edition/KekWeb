// Aggiunge un listener per l'evento di submit al form con id 'studyForm'
document.getElementById('studyForm').addEventListener('submit', function (event) {
    console.log("kek");
    // Previene il comportamento di default dell'evento, che sarebbe il submit del form
    event.preventDefault();

    // Ottiene il tempo di studio inserito dall'utente e lo converte in un numero intero
    const studyTime = parseInt(document.getElementById('studyTime').value, 10);
    // Converte i minuti in secondi per l'animazione
    const animationDuration = studyTime * 60;

    // Imposta l'animazione con durata dinamica per gli pseudo-elementi ::before e ::after
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .blob::before, .blob::after {
            animation: rotate ${animationDuration}s linear forwards;
        }
    `;
    // Aggiunge il foglio di stile creato all'elemento head del documento
    document.head.appendChild(styleSheet);

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


function time(event) {
    print("user has written something");
};


function updateFormat(){
    let isCycles = document.getElementById("cyclesButton").checked;
    if(isCycles)
    {
        //changing buttons
        console.log("cycles");
        document.getElementById("cycles").style.setProperty('display', 'block');
        document.getElementById("totalTime").style.setProperty('display', 'none');
        
        //changing instructions
        console.log("instructions changed");
        document.getElementById("cyclesLB").style.setProperty('display', "block" );
        document.getElementById("totalTimeLB").style.setProperty('display', "none");
    }else{

        //changing buttons
        console.log("time");
        document.getElementById("cycles").style.setProperty('display', 'none');
        document.getElementById("totalTime").style.setProperty('display', 'block');

        //changing instructions
        console.log("instructions changed");
        document.getElementById("cyclesLB").style.setProperty('display', "none" );
        document.getElementById("totalTimeLB").style.setProperty('display', "block");
    }
}