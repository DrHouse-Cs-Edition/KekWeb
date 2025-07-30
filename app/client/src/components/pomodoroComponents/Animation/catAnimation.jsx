import {useRef, useEffect } from "react";

import style from "./catAnimation.module.css"
import cx from 'classnames'

const CatAnimation = ({run, resetFlag})=>{
    const animationRef = useRef(null);

    useEffect(function resetAnimation(){
        console.log("animationRef ", animationRef.current)
        if(animationRef.current && animationRef.current.style){
            animationRef.current.style.animationName = "none";
        setTimeout(()=>{
            animationRef.current.style.animationName = "";
        }, 100);
        }
    },[resetFlag]);

    return(
        <div className={style.CatAnimation_container}>
            <div className={style.CatAnimation} style={{animationPlayState : run ? "running" : "paused"}} useRef={animationRef}>
            <div className={cx(style.ear, style.ear_left)}><Ear_outer/></div>
            <Cat_face></Cat_face>
            <div className={cx(style.ear, style.ear_right)}><Ear_outer/></div>
            </div>
        </div>
        
    )
}

const Ear_inner = ()=>{
    return(
        <div className={style.ear_inner}></div>
    )
}

const Ear_outer = ()=>{
    return(
        <div>
            <div className={style.ear_outher}></div>
            <Ear_inner/>
        </div>
    )
}

const Eye = ()=>{
    return(
        <div className={style.eye_outher}>
            <div className={style.eye_inner}></div>
        </div>
    )
}

const Cat_face = ()=>{
    return(
        <div className={style.face}>
            <div className={cx(style.eye, style.eye_left)}><Eye/></div>
            <div className={style.nose}></div>
            <div className={cx(style.eye, style.eye_right)}><Eye/></div>    
        </div>
    )
}

export default CatAnimation;