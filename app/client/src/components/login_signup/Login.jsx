import React, {useState} from "react";
import { Input } from "../utils/Input";
import {FormProvider, useForm} from "react-hook-form";

async function loginAttempt(credentials) {
    return fetch(("/api/login/sendLogin"),{
        method : "POST",
        headers:{
            'content-type' : "application/json"
        },
        body : JSON.stringify(credentials)
    })
    .then(data => data.json());
}

function Login({setToken}){
    // const [username, setUsername] = useState("");
    // const [password, setPassword] = useState("");

    const onSubmit = (async data=>{
        try{
            console.log("Submit of login credentials ", data.username , " " , data.password);
            let token = await loginAttempt({"username" : data.username, "password" : data.password});
            setToken(token);
            console.log(token);
        }catch(e){
            console.log("error in login form: ", e);
        }
    })

    const formMethods = useForm();
    return(
        <div>
            <h2>Login</h2>
            <FormProvider {...formMethods} >
                <form>
                    <Input
                    label = {"username"}
                    type = "string"
                    id = "Username"
                    placeholder={"insert username"}
                    validationMessage={"please enter your username"}
                    maxLenght={16}
                    ></Input>
                    <Input 
                    label={"password"}
                    type={"password"}
                    id={"Password"}
                    placeholder={"please insert your password"}
                    validationMessage={"please enter your password"}
                    minLenght={8}
                    >
                    </Input>
                </form>
                <button id="loginSend" type="button" onClick={formMethods.handleSubmit(onSubmit)}>Login</button>
            </FormProvider>
        </div>
    );
}

export default Login;
