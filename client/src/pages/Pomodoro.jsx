import React, { Fragment, useEffect, useState } from "react";
import Navbar from '../components/Navbar.jsx'
import {TTform, CyclesForm} from "../components/pomodoroComponents/FormSelector.jsx";

//images section
import desk from "./images/desk.png"
import clock from "./images/clock2.png"
import paper1 from "./images/paper/paperPile1.png"
import paper2 from "./images/paper/paperPile2.png"
import paper3 from "./images/paper/paperPile3.png"
import paper4 from "./images/paper/paperPile4.png"
import paper5 from "./images/paper/paperPile5.png"
import "./pomodoro.css"

function Pomodoro(){

    let [formType, updateFormType] = useState('TT');

    let formComponents = {
      TT : <TTform></TTform>,
      Cycles : <CyclesForm></CyclesForm>
    }

    function changeForm(){
      formType == 'TT' ? updateFormType('Cycles') : updateFormType('TT');
      console.log("changeForm");
      //switches the form type reference 
    }

    //formComponents is an object, and TT and Cycles it's attributes. To the TT/cycles attribute i assign a component
    //to access a component i use a similar syntax to that of arrays. I can use a different component based on the index
    //of the object (i'm accessing the component stored in the attribute)

    let currentComponent = formComponents[formType];
  
    let cycles;
    let pause;
    let study;
    //TODO update these variables from child forms and use them for animation
    return(
      <Fragment>
        {formComponents[formType]}
        <button onClick={changeForm}>Change Format</button>
        <div className="paperDestroyer3000">
          <div id="deskDiv">
            <img id="desk" src={desk} alt="desk image"></img>
              <img src={clock} id="clockIMG" alt="clock image"></img>
              <div className="timer" id="timerDisplay">
                00:00
              </div>
            <div id="paperDiv">
              <img src={paper1} id="imageSpace" alt="two big piles of paper"></img>
            </div>
          </div>
        </div>        
        </Fragment>
    );
  }
export default Pomodoro;



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
          imgPaper.src = paper5;
      } else if (elapsedPercentage >= 60) {
          imgPaper.src = paper4;
      } else if (elapsedPercentage >= 40) {
          imgPaper.src = paper3;
      } else if (elapsedPercentage >= 20) {
          imgPaper.src = paper2;
      } else {
          imgPaper.src = paper1;
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