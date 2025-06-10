import React, {useState} from "react";
import { Input } from "../../utils/Input";
import {FormProvider, useForm} from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { useUsername } from "./UserHooks";

// const userSchema = new Schema({
//     name: String,
//     password: String, // per ora tipo String, poi vediamo cosa fanno le librerie "password1!" -> "2ashvd&%fewf&//°Lè&"
//     email: String,
//     bio: String,
//     birthday: Date,
//     // _id lo da già mongoDB (e viene usato come chiave esterna da altri Schema)
// });

async function registerUser(data) {

    try {
        return fetch("http://localhost:5000/api/user/sendRegistration",{
        method : "POST",
        headers:{
            'Content-Type': 'application/json',
        },
        body : JSON.stringify({
            username : data.username,
            password : data.password,
            email : data.email,
            bio : data.bio,
            birthday : data.birthday,
            name : data.name,
            surname : data.surname
            })
        }).then(res => res.json())
        .then(json => {
            if(!json.success){
                console.log("registration failed");
                alert(json.message);
            }
            console.log("response to create user was ", json);
            return json;

        })
        .catch(error => console.error("error in registration: ", error));
    }catch(e){
        alert("Error when recording new user");
        console.log("registration fetch error: ", e);
    }
}

function Registration({updateToken}){
    const {username, setUsername} = useUsername();
    // const [username, setUsername] = useState("");
    // const [password, setPassword] = useState("");

    const onSubmit = (async data=>{
        try{
            let response = await registerUser(data);
            updateToken(response);
            setUsername(data.username);
        }catch(e){
            console.log("error in login form: ", e);
        }
    })


    const formMethods = useForm();
    return(
        <div>
            <h1>Pagina di registrazione</h1>
            <FormProvider {...formMethods} >
                <form>
                    <Input
                    label = {"username"}
                    type = "string"
                    id = "username"
                    placeholder={"insert username"}
                    validationMessage={"please enter your username"}
                    maxLenght={16}
                    ></Input>

                    <Input 
                    label={"password"}
                    type={"password"}
                    id={"password"}
                    placeholder={"insert your password"}
                    validationMessage={"please enter your password"}
                    minLenght={8}
                    >
                    </Input>

                    <Input 
                    label={"email"}
                    type={"email"}
                    id={"email"}
                    placeholder={"insert your email"}
                    validationMessage={"please enter your email"}
                    isRequired = {0}
                    >
                    </Input>

                    <Input 
                    label={"bio"}
                    type={"string"}
                    id={"bio"}
                    placeholder={"enter bio"}
                    validationMessage={"please enter some personal information"}
                    isRequired = {0}
                    >
                    </Input>

                    <Input 
                    label={"birthday"}
                    type={"date"}
                    id={"birthday"}
                    placeholder={"insert your birthday"}
                    validationMessage={"please enter your birthday"}
                    isRequired = {0}
                    >
                    </Input>

                    <Input 
                    label={"name"}
                    type={"string"}
                    id={"name"}
                    placeholder={"insert your real name"}
                    validationMessage={"please enter your real name"}
                    >
                    </Input>

                    <Input 
                    label={"surname"}
                    type={"string"}
                    id={"surname"}
                    placeholder={"insert your real surname"}
                    validationMessage={"please enter your surname"}
                    >
                    </Input>

                    <button id="loginSend" type="button" onClick={formMethods.handleSubmit(onSubmit)}>Register user</button>
                </form>
            </FormProvider>
        </div>
    );
}

export default Registration;
