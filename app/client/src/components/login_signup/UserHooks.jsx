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
    }
}
export {getPersonalData};

/**
 * 
 * @param {string} username 
 * @param {string} password 
 * function fetches to server, sending a username and passowrd, and returns 1 if the credentials are valid, 0 otherwise
 * The return value is sent to the callback function
 */
const checkPassword = (username, password, callback)=>{
    fetch("/api/user/reqLogin", {
        method: "POST",
        mode: "cors",
        headers:{
            'Content-Type': 'application/json',
             'Accept': 'application/json',
        },
        body: JSON.stringify({username : username, password : password})
        })
        .then(res => res.json())
        .then(
            data =>{
                callback(data.success);
            }
        )
}

export {checkPassword};