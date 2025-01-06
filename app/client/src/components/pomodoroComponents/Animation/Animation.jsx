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
//!REQUIREMENTS
//cuurentTimer is a state, updated via syntax (a => a + 1) as it updates without the need for a rerender
//studyTime, breakTime and run too
//resetFlag is a state that is used to reset the timer when the user clicks the reset button; it restores the animation to a 0% progress
export const Animation = ({currentTimer, studyTime, breakTime, run, resetFlag})=>{
    //testing
    // const [runn, setRun] = useState(1);
    // const [current, setCurrent] = useState(0);
    
    const animationDiv = useRef(null);
    const animationDiv_outher = useRef(null);
    const animationDiv_inner = useRef(null);
    let loadingBar = {
        0 : <StudyAnimation duration = {studyTime + "s"} run = {run && !currentTimer} resetFlag = {resetFlag}></StudyAnimation>,
        1 : <BreakAnimation duration = {breakTime + "s"} run = {run && currentTimer} resetFlag = {resetFlag}></BreakAnimation>
    } 

    useEffect(function initializeAnimation (){  console.log("Animation.jsx: initialization start"); },[])
    
    useEffect(()=>{ console.log("currentTimer is: ", currentTimer, " and thus animation changes");    },[currentTimer])

    return(
        <div className={style.animationDiv} ref={animationDiv} >
            <div className={[style.loadingBar, style.outherBar].join(" ")} ref={animationDiv_outher}>
                    {/* {currentTimer ? <StudyAnimation duration = {"5s"} run = {run && currentTimer}></StudyAnimation> :
                    <BreakAnimation duration = {"5s"} run = {run && !currentTimer}></BreakAnimation>} */}
                    {loadingBar[currentTimer]}
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
const StudyAnimation = ({duration, run, resetFlag})=>{
    const reference = useRef();
    useEffect(()=>{
        console.log("StudyAnimation");
    },[])
    

    useEffect(function resetAnimation(){
        reference.current.style.animationName = "none";
        setTimeout(()=>{
            reference.current.style.animationName = "";
            console.log("animation reset to",reference.current.style );
        }, 100);
    },[resetFlag])

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
const BreakAnimation = ({duration, run, resetFlag})=>{
    const reference = useRef();
    useEffect(()=>{
        console.log("BreakAnimation");
    },[])

    useEffect(function resetAnimation(){
        reference.current.style.animationName = "none";
        setTimeout(()=>{
            reference.current.style.animationName = "";
            console.log("animation reset to",reference.current.style );
        }, 100);
    },[resetFlag])

    return(
        <div className={[style.loadingBar, style.breakBar].join(" ")} 
            ref={reference}
            style={{animationDuration : duration, animationPlayState : run ? "running" : "paused", animation : ()=> {
                //! TODO change style for reset
            }}} >
        </div>
    )
}