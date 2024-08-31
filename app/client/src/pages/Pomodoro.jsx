import React, { useEffect, useState } from "react";
import Navbar from '../components/Navbar.jsx'

function Pomodoro(){

    const [htmlContent, setHtmlContent] = useState("");
  
    useEffect(() => {
      // Fetch the HTML content from the public directory
      fetch("/Pomodoro/pomodoro.html")
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
        <>
        <Navbar/>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </>
    );
  }
export default Pomodoro;