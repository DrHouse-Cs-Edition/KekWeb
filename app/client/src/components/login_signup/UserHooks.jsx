import {useState, useEffect, Fragment, useRef} from 'react';
import React from 'react';
import { json } from 'react-router-dom';
const UseToken = ()=>{
    const getToken = () => {
        const tokenString = sessionStorage.getItem("token");
        console.log("token is: ", tokenString);
        return tokenString;    //as getToken is called upon rendering, first time the object is undefined
    }

    const [token, updateToken] = useState(getToken());

    const setToken = (userToken)=>{
        sessionStorage.setItem("token", userToken.token);
        updateToken(userToken.token);
        console.log("token is now", sessionStorage.getItem("token"));
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
        console.log("username is: ", username);
        return username;    //as getToken is called upon rendering, first time the object is undefined
    }

    const [username, setUsername] = useState(getUsername());

    const updateUsername = (username)=>{
        sessionStorage.setItem("username", username);
        setUsername(username);
        console.log("username is now", sessionStorage.getItem("username"));
        return getUsername();
    }

    return {
        setUsername: updateUsername,
        username
    }
}

export {useUsername};