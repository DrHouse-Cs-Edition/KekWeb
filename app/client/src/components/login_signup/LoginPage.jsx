import React, {useState} from "react";
import { Input } from "../utils/Input";
import {FormProvider, useForm} from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

async function loginAttempt(username, password, updateToken) {
    console.log("sending login request for user ", username, "pw: ", password);
    try {
        return await fetch("http://localhost:5000/api/user/reqLogin",{
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
                updateToken(username);
                console.log("LOGIN SUCCESSFUL: token is set to: ", username);
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
        try{
            console.log("Submit of login credentials ", data.name , " " , data.password);
            let {name, password} = data;
            await loginAttempt(name, password, updateToken);
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
                    <Input label = {"name"}
                    type = "string"
                    id = "name"
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
