import React, { Fragment, useEffect, useState } from "react";
import Navbar from '../components/Navbar.jsx'
import "../StyleSheets/pomodoro.css"
import FormSelector from "../components/pomodoroComponents/FormSelector.jsx";

function Pomodoro(){

    const [htmlContent, setHtmlContent] = useState("");

    let [formType, updateFormType] = useState(0);
    let [option, updateOption ]=useState(0);
  
    useEffect(() => {
      // Fetch the HTML content from the public directory
      fetch("./pomodoro.html")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((data) => {
          setHtmlContent(data);
        })
        .catch((error) => {
          console.error("Error fetching HTML content:", error);
        });
    }, []);
  
    return (
        <Fragment>
        <Navbar/>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        <FormSelector formType={formType} updateFormType={updateFormType} option={option} updateOption={updateOption} ></FormSelector>
        </Fragment>
    );
  }
export default Pomodoro;