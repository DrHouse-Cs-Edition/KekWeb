import React, { useState, Fragment, useRef, useEffect, createRef } from "react";
import style from './Animation.module.css';

//TODO
/**
 * 1) create loading bar
 * 2) synch loading bar 
 * 3) add contextual text
 * 4) add bar to the main page and couple
 * 5) whatever i need to do for the image swapping
 */

//**CSS TIPS AND TRICKS
// Accessing a components css
// useRef to get a reference to the dom element
// .current.style to access the style
// .<whatever> to modify the style element. It might not show up in the dev tools
// reference.current.style.margin
//  */

export const Animation = ({currentTimer, studyTime, breakTime, run})=>{
    //testing
    const [runn, setRun] = useState(1);
    const [current, setCurrent] = useState(0);
    console.log("timer :", current, ", study: ", studyTime, ", break: ", breakTime, ", run: ", runn);

    const animationDiv = useState(null);
    const animationDiv_outher = useRef(null);
    const animationDiv_inner = useRef(null);

    let loadingBar = {
        0 : <StudyAnimation duration = {"5s"} run = {runn && !current}></StudyAnimation>,
        1 : <BreakAnimation duration = {"5s"} run = {runn && current}></BreakAnimation>
    } 

    useEffect(function initializeAnimation (){
        console.log("Animation.jsx: initialization start");
        setTimeout(()=>{
            setCurrent(current^1);
            console.log("currentTimer is: ", current, " and run is: ", runn );
        }, 6000)
        },[])

    return(
        <div className={style.animationDiv} ref={animationDiv} >
            <div className={[style.loadingBar, style.outherBar].join(" ")} ref={animationDiv_outher}>
                    {/* {currentTimer ? <StudyAnimation duration = {"5s"} run = {run && currentTimer}></StudyAnimation> :
                    <BreakAnimation duration = {"5s"} run = {run && !currentTimer}></BreakAnimation>} */}
                    {loadingBar[current]}
            </div>
            <br></br>
        </div>
    )
}

//for multiple classes: [style.innerBar, style.studyBar].join(" ")
//**STUDY ANIMATION
//  
// 
//  */
const StudyAnimation = ({duration, run})=>{
    useEffect(()=>{
        console.log("StudyAnimation");
    },[])
    const reference = useRef();


    return(
        <div className={[style.loadingBar, style.studyBar].join(" ")} 
            ref={reference}
            style={{animationDuration : duration, animationPlayState : run ? "running" : "paused"}} >
        </div>
    )
}

//**BREAK ANIMATION
//  
// 
//  */
const BreakAnimation = ({duration, run})=>{
    const reference = useRef();
    useEffect(()=>{
        console.log("BreakAnimation");
    },[])

    return(
        <div className={[style.loadingBar, style.breakBar].join(" ")} 
            ref={reference}
            style={{animationDuration : duration, animationPlayState : run ? "running" : "paused"}}>
        </div>
    )
}