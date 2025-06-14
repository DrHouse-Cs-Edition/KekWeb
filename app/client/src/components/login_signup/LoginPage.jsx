import React, {useState} from "react";
import { Input } from "../../utils/Input";
import {FormProvider, useForm} from "react-hook-form";
import { useUsername, getPersonalData } from "./UserHooks";

function loginAttempt(username, password) {
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
                return(response.json());
        break;
            case 401:
        break;
            case 500:
        break;
            default:
        break;
        }
    });
    }catch(e){
        console.log("client side login error ", e);
    }
}

const LoginPage = ({updateToken})=>{
    const {setUsername} = useUsername();

    const [showPassword, setShowPassword] = useState(0);

    const alternateShowPassword = () => {
        setShowPassword(showPassword => showPassword ^ 1);
    }

    const onSubmit = async (data)=>{
        try{
            let {username, password} = data;
            let tmpKek = await loginAttempt(username, password, updateToken);
                updateToken(tmpKek);
                password = null;
                setUsername(username);
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
                    type= {showPassword ? "text" : "password"}
                    id={"password"}
                    placeholder={"please insert your password"}
                    validationMessage={"please enter your password"}
                    minLenght={8}
                    ></Input>

                    <button id="showPassowrdButton" type="button" onClick={alternateShowPassword }> {showPassword ? "Hide Password" :"Show Password"}</button>

                    <button id="loginSend" type="button" onClick={formMethods.handleSubmit(onSubmit)}>Login</button>
                </form>
            </FormProvider>
        </div>
    );
}

export default LoginPage;
