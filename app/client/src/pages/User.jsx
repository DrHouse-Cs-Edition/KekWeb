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
    const [email, setEmail] = useState();
    const [bio, setBio] = useState();
    const [birthday, setBirthday] = useState();
    const [realName, setName] = useState();
    const [realSurname, setSurname] = useState();

    //*FUNCTION GETS PERSONAL DATA FROM SERVER 
    const updatePersonalData = async ()=>{
        const params = new URLSearchParams([["email" , 1], ["bio", 1], ["birthday", 1], ["realName", 1], ["realSurname", 1]]);
        await getPersonalData(params)
        .then(data => data.json())
        .then((data) =>{
            let {email : e, bio : b, birthday : bd, realName : rn, realSurname : rs} = data;
            setEmail(e);
            setBio(b);
            const dateArr = bd.split("T");
            setBirthday(dateArr[0]);
            setName(rn);
            setSurname(rs);
        })
    }

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
                    isRequired = {0}
                    readonly={1}
                    ></Input>

                    <Input
                    label = {"Bio"}
                    type = "string"
                    id = "Bio"
                    value={"bio"}
                    isRequired = {0}
                    ></Input>

                    <Input
                    label = {"Birthday"}
                    type = "date"
                    id = "birthday"
                    value={birthday}
                    isRequired = {0}
                    ></Input>

                    <Input
                    label = {"Name"}
                    type = "string"
                    id = "name"
                    value={realName}
                    validationMessage={"please enter your surname"}
                    ></Input>

                    <Input
                    label = {"Surname"}
                    type = "string"
                    id = "surname"
                    value={realSurname}
                    validationMessage={"please enter your surname"}
                    ></Input>
                </FormProvider>
            </div>

            <button onClick={logout}>Logout</button>
            <button onClick={formMethods.handleSubmit(onSubmit(), onError())}> Save</button>
            
        </div>
    )
}

export default User;