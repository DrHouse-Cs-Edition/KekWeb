import { useEffect, useRef, useState } from "react";
import { useUsername, UseToken, getPersonalData } from "../components/login_signup/UserHooks";
import {FormProvider, useForm} from "react-hook-form";

import { Input } from "../components/utils/Input";
import style from "./User.module.css";

const User = ()=>{
    const formMethods = useForm();

    const {username, setUsername} = useUsername();
    const {token, setToken} = UseToken();

    //*********** Rendered Data ***********/
    const [email, setEmail] = useState();               const [mailMod, setMailMod] = useState(0);
    const [bio, setBio] = useState();                   const [bioMod, setBioMod] = useState(0);
    const [birthday, setBirthday] = useState();         const [bdMod, setBdMod] = useState(0);
    const [realName, setName] = useState();             const [nameMod, setNameMod] = useState(0);
    const [realSurname, setSurname] = useState();       const [surnameMod, setSurnameMod] = useState(0);

    //*FUNCTION GETS PERSONAL DATA FROM SERVER 
    const updatePersonalData = async ()=>{
        const params = new URLSearchParams([["email" , 1], ["bio", 1], ["birthday", 1], ["realName", 1], ["realSurname", 1]]);
        await getPersonalData(params)
        .then(data => data.json())
        .then((data) =>{
            let {email : e, bio : b, birthday : bd, realName : rn, realSurname : rs} = data;
            setEmail(e);
            setBio(b);
            const dateArr = bd?.split("T");
            setBirthday(dateArr ? dateArr[0] : null);
            setName(rn);
            setSurname(rs);
            console.log(realName, "   k");
        })
    }

    //!porcozzio il valore deve cambiare qua che palle

    useEffect(()=>{
        updatePersonalData();
    }, [])

    const logout = ()=>{
        try{
            fetch("/api/user/logout", {
            method: "DELETE",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({username : username})
        })
            .then(res => res.json())
            .then( (res)=>{              
                setToken({token : ""});
                setUsername("");  
                window.location.reload(false);
            })
        }catch(e){
            console.log("error in user page, logout phase: ", e);
        }  
    }

    function onSubmit(data) {
        //send data to the server in case any changes have been detected  
        fetch("/api/user/sendData", {

        })

    }

    function onError(e){
        console.log("error in user page: ", e);
    }

    return(
        <div className="user">
            <h1> Welcome to your home page </h1>
            <h1> {username} </h1>

            <div className={style.info} >
                <FormProvider {...formMethods} >
                    <Input
                    label = {"email"}
                    type = "email"
                    id = "email"
                    placeholder={"email"}
                    value={email}
                    isRequired = {0}
                    readonly={mailMod}
                    ></Input>
                    <button onClick={()=>{setMailMod(mailMod ^ 1)}}> {mailMod ? "Modify" : "Lock"}</button>

                    <Input
                    label = {"Bio"}
                    type = "string"
                    id = "Bio"
                    value={bio}
                    isRequired = {0}
                    readonly={bioMod}
                    ></Input>
                    <button onClick={()=>{setBioMod(bioMod ^ 1)}}> {bioMod ? "Modify" : "Lock"}</button>

                    <Input
                    label = {"Birthday"}
                    type = "date"
                    id = "birthday"
                    value={birthday}
                    isRequired = {0}
                    readonly={bdMod}
                    ></Input>
                    <button onClick={()=>{setBdMod(bdMod ^ 1)}}> {bdMod ? "Modify" : "Lock"}</button>

                    <Input
                    label = {"Name"}
                    type = "string"
                    id = "name"
                    value={realName}
                    validationMessage={"please enter your surname"}
                    readonly={nameMod}
                    ></Input>
                    <button onClick={()=>{setNameMod(nameMod ^ 1)}}> {nameMod ? "Modify" : "Lock"}</button>

                    <Input
                    label = {"Surname"}
                    type = "string"
                    id = "surname"
                    value={realSurname}
                    validationMessage={"please enter your surname"}
                    readonly={surnameMod}
                    ></Input>
                    <button onClick={()=>{setSurnameMod(surnameMod ^ 1)}}> {surnameMod ? "Modify" : "Lock"}</button>
                </FormProvider>
            </div>

            <button onClick={logout}>Logout</button>
            <button onClick={formMethods.handleSubmit(onSubmit(), onError())}> Save</button>            
        </div>
    )
}

export default User;