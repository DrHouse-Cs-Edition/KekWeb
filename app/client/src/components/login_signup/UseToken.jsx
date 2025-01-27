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

export default UseToken;