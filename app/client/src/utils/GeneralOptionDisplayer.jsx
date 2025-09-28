import React, { Fragment, useState, useEffect } from "react";

const GenOptionDisplayer = ({optionA, optionB, optionC})=>{

    // let cycles = optionA;
    // let studyTime = optionB;
    // let breakTime = optionC;
  
    return(
      <Fragment>
        <div className="optionDisplayer" >  
          <span> Tempo di studio: </span> {optionA}
          <span> Tempo di pausa: </span> {optionB}
          <span> Cicli: </span> {optionC}
        </div>
      </Fragment>
    )
  }
  
  export {GenOptionDisplayer};