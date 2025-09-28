import React, {useState} from "react";
import { Input } from "../../utils/Input";
import {FormProvider, useForm} from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { useUsername } from "./UserHooks";
import style from "./Registration.module.css"

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
            surname : data.surname,
            notifications : data.notifications ? "email" : "disabled"
            })
        }).then(res => res.json())
        .then(json => {
            if(!json.success){
                console.log("registration failed");
                alert(json.message);
            }
            else{
                alert("Utente creato correttamente");
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

    const onSubmit = async (data)=>{
        try{
            let response = await registerUser(data);
            updateToken(response);
            setUsername(data.username);
        }catch(e){
            console.log("error in login form: ", e);
        }
    }


    const formMethods = useForm();
    return(
        <div>
            <h1>Pagina di registrazione</h1>
            <div>
            <FormProvider {...formMethods} >
                <form className={style.RegistrationForm}>
                    <Input
                    label = {"username"}
                    type = "text"
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

                    <label className={style.checkbox}>
                        <input
                            label="abilita notifiche via email"
                            type="checkbox"
                            id="notifications"
                        />
                        abilita notifiche via email
                    </label>

                    <Input 
                    label={"bio"}
                    type={"text"}
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
                    type={"text"}
                    id={"name"}
                    placeholder={"insert your real name"}
                    validationMessage={"please enter your real name"}
                    >
                    </Input>

                    <Input
                    label={"surname"}
                    type={"text"}
                    id={"surname"}
                    placeholder={"insert your real surname"}
                    validationMessage={"please enter your surname"}
                    >
                    </Input>

                    <button id="loginSend" type="submit" onClick={formMethods.handleSubmit(onSubmit)} className={style.Buttons}>Register user</button>
                </form>
            </FormProvider>
            </div>
        </div>
    );
}

export default Registration;
