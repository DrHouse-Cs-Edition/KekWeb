import React, { Fragment, useState, useEffect } from "react";

const GenOptionDisplayer = ({optionA, optionB, optionC})=>{

    // let cycles = optionA;
    // let studyTime = optionB;
    // let breakTime = optionC;
  
    return(
      <Fragment>
        <div className="optionDisplayer" >  
          <div className="optionDisplayer_Option"> <p> Study Time: </p> {optionA}</div>
          <div className="optionDisplayer_Option"> <p> Break Time: </p> {optionB}</div>
          <div className="optionDisplayer_Option"> <p> Cycles: </p> {optionC}</div>
        </div>
      </Fragment>
    )
  }
  
  export {GenOptionDisplayer};