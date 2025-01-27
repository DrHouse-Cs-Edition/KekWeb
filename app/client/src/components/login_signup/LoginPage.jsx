import React, {useState} from "react";
import { Input } from "../utils/Input";
import {FormProvider, useForm} from "react-hook-form";
import { json, Navigate, useNavigate } from "react-router-dom";

function loginAttempt(username, password, setToken) {
    console.log("sending login request for user ", username, "pw: ", password);
    try {
        return fetch("http://localhost:5000/api/user/reqLogin",{
        method : "POST",
        headers:{
            'content-type' : "application/json"
        },
        body : JSON.stringify({
            username : username, 
            password : password,
        })
    })
    .then(response => {
        switch(response.status){
            case 200:
                console.log("LOGIN PROGRESSING");
                return(response.json());
        break;
            case 401:
                console.log("LOGIN UNSUCCESSFUL: invalid username or password");
        break;
            case 500:
                console.log("LOGIN UNSUCCESSFUL: internal server error");
        break;
            default:
            console.log("ah shit");
        break;
        }
    }).catch(console.log( "error in login attempt" ));
    }catch(e){
        console.log("client side login error ", e);
    }
}

const LoginPage = ({updateToken})=>{

    const onSubmit = async (data)=>{
        console.log("saved token env: ", process.env.REACT_APP_JWT_KEY);
        try{
            console.log("Submit of login credentials ", data.username , " " , data.password);
            let {username, password} = data;
            let tmpKek = await loginAttempt(username, password, updateToken);
                console.log("response to login request is: ", tmpKek)
                updateToken(tmpKek);
                // setToken(response.body) ? console.log("LOGIN SUCCESSFUL: token is set to: ", username)
                // : console.log("LOGIN UNSUCCESSFUL");
        }catch(e){
            console.log("error in login form: ", e);
            alert("login failed: check your credentials"); 
            updateToken(null);
        }
    }

    const formMethods = useForm();
    return(
        <div>
            <h2>Login</h2>
            <FormProvider {...formMethods} >
                <form>
                    <Input label = {"username"}
                    type = "string"
                    id = "username"
                    placeholder={"insert username"}
                    validationMessage={"please enter your username"}
                    maxLenght={32}
                    ></Input>

                    <Input label = {"password"}
                    type={"password"}
                    id={"password"}
                    placeholder={"please insert your password"}
                    validationMessage={"please enter your password"}
                    minLenght={8}
                    ></Input>

                    <button id="loginSend" type="button" onClick={formMethods.handleSubmit(onSubmit)}>Login</button>
                </form>
            </FormProvider>
        </div>
    );
}

export default LoginPage;
