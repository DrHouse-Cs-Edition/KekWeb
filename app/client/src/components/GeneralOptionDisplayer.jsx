import React, { Fragment, useState, useEffect } from "react";

const GenOptionDisplayer = ({optionA, optionB, optionC})=>{

    // let cycles = optionA;
    // let studyTime = optionB;
    // let breakTime = optionC;
  
    return(
      <Fragment>
        <div className="optionDisplayer" >  
          <span> Study Time: </span> {optionA}
          <span> Break Time: </span> {optionB}
          <span> Cycles: </span> {optionC}
        </div>
      </Fragment>
    )
  }
  
  export {GenOptionDisplayer};