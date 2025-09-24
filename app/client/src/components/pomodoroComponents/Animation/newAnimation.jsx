import style from "./newAnimation.module.css"
import { useRef, useEffect} from "react";
import CatAnimation from "./CatAnimation.jsx";

export const Animation2 = ({currentTimer, studyTime, breakTime, run, resetFlag})=>{
    //testing
    // const [runn, setRun] = useState(1);
    // const [current, setCurrent] = useState(0);

    const animationDiv = useRef(null);

    return(
        <div className={style.animationDiv} ref={animationDiv} >
            {currentTimer ? 
                <div style={{height : "180px", width : "130"
                }}><CatAnimation run = {run && currentTimer} resetFlag = {resetFlag}></CatAnimation></div> : 
                <StudyAnimation_new run = {run && !currentTimer} resetFlag = {resetFlag}></StudyAnimation_new>}
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
    },[])


    useEffect(function resetAnimation(){
        reference.current.style.animationName = "none";
        setTimeout(()=>{
            reference.current.style.animationName = "";
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

    useEffect(function resetAnimation(){
        reference.current.style.animationName = "none";
        setTimeout(()=>{
            reference.current.style.animationName = "";
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

//style={{animationPlayState: run ? "running" : "paused"}}

const StudyAnimation_new = ({run, resetFlag})=>{
    useEffect(()=>{
        console.log("run is: ", run);
    },[])

    const ContainerRef = useRef(null);
    const CurvesRef = useRef(null);
    const Sand = useRef(null);
    const SandStreamRef = useRef(null);

    useEffect(function resetAnimation(){
        ContainerRef.current.style.animationName = "none";
        CurvesRef.current.style.animationName = "none";
        Sand.current.style.animationName = "none";
        SandStreamRef.current.style.animationName = "none";
        setTimeout(()=>{
            ContainerRef.current.style.animationName = "";
            CurvesRef.current.style.animationName = "";
            Sand.current.style.animationName = "";
            SandStreamRef.current.style.animationName = "";
        }, 100);
    },[resetFlag])

    return (
        <div class={style.hourglassBackground}>
            <div class={style.hourglassContainer} style={{animationPlayState: run ? "running" : "paused"}} ref={ContainerRef}>
                <div class={style.hourglassCurves} style={{animationPlayState: run ? "running" : "paused"}} ref={CurvesRef}></div>
                <div class={style.hourglassCapTop}></div>
                <div class={style.hourglassGlassTop}></div>
                <div class={style.hourglassSand} style={{animationPlayState: run ? "running" : "paused"}} ref={Sand}></div>
                <div class={style.hourglassSandStream}style={{animationPlayState: run ? "running" : "paused"}} ref={SandStreamRef}></div>
                <div class={style.hourglassCapBottom}></div>
                <div class={style.hourglassGlass}></div>
            </div>
        </div>
    )
}

export default Animation2;