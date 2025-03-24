import {useState, useEffect, Fragment, useRef} from 'react';
import React from 'react';
import { json } from 'react-router-dom';
const UseToken = ()=>{
    const getToken = () => {
        const tokenString = sessionStorage.getItem("token");
        return tokenString;    //as getToken is called upon rendering, first time the object is undefined
    }

    const [token, updateToken] = useState(getToken());

    const setToken = (userToken)=>{
        sessionStorage.setItem("token", userToken.token);
        updateToken(userToken.token);
        return getToken();
    }

    return {
        setToken: setToken,
        token
    }
}

export {UseToken};

const useUsername = ()=>{
        const getUsername = () => {
        const username = sessionStorage.getItem("username");
        return username;    //as getToken is called upon rendering, first time the object is undefined
    }

    const [username, setUsername] = useState(getUsername());

    const updateUsername = (username)=>{
        sessionStorage.setItem("username", username);
        setUsername(username);
        return getUsername();
    }

    return {
        setUsername: updateUsername,
        username
    }
}

export {useUsername};

const getPersonalData = async (params)=>{   
    //*params is a URLsearchParams object
    //console.log("parameters are ", params.toString());
    try{
        return await fetch(`/api/user/getData?${params.toString()}`, {
         method: "GET", 
         mode: "cors",
         headers:{
             'Content-Type': 'application/json',
             'Accept': 'application/json',
         }})
    }catch(e){
        console.log(e);
        return {
        email : "defaultMail@lezzo.kek",
        bio : "chemical weapon",
        birthday : "1/9/1939",
        realName : "Orazio",
        realSurname : "Grinzosi"
        }
    }
}

export {getPersonalData};