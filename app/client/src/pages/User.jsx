import { useEffect, useRef, useState } from "react";
import { useUsername, UseToken, getPersonalData, checkPassword } from "../components/login_signup/UserHooks";
import {FormProvider, useForm} from "react-hook-form";

import { Input } from "../components/utils/InputV2";
import style from "./User.module.css";

const User = ()=>{
    const formMethods = useForm();

    const {username, setUsername} = useUsername();
    const {token, setToken} = UseToken();

    //*********** Rendered Data ***********/
    const [email, setEmail] = useState(); const [bio, setBio] = useState(); const [birthday, setBirthday] = useState(); const [name, setName] = useState();
    const [surname, setSurname] = useState(); const [lock, setLock] = useState(1); const [CPW, setCPW] = useState();

    const [showForm, setShowForm] = useState(0);
    const [showCPW, setShowCPW] = useState(0);
    const [attempts, setAttempts] = useState(0);

    //*FUNCTION GETS PERSONAL DATA FROM SERVER 
    const updatePersonalData = async ()=>{
        const params = new URLSearchParams([["email" , 1], ["bio", 1], ["birthday", 1], ["name", 1], ["surname", 1]]);
        getPersonalData(params)
        .then(data => data.json())
        .then((data) =>{
            let {email : e, bio : b, birthday : bd, name : rn, surname : rs} = data;
            setEmail(e);
            setBio(b);
            const dateArr = bd?.split("T");
            setBirthday(dateArr ? dateArr[0] : null);
            setName(rn);
            setSurname(rs);
        }).then(setShowForm(1))
    }

    //update personal data on component render
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

    const onSubmit =  (data) =>{
        checkPassword(username, CPW, (result) => {
        console.log("lezzo: ", result); 
        if(!result){  //if inserted password is wrong, clear it and ask for confirmation.
            if(attempts >= 3){
                alert("logging out for security reasons");
                logout();
            }else{
                alert("incorrect password: more than 3 attempts will lead to a forced logout ");
                setAttempts(attempts + 1);
            }
            return;
        }else{
            try {
                return fetch("http://localhost:5000/api/user/updateUData",{
                method : "PUT",
                headers:{
                    'Content-Type': 'application/json', //header necessary for correct JSON data format
                },
                body : JSON.stringify({
                    username : username,
                    email : data.Email,
                    bio : data.Bio,
                    birthday : data.Birthday,
                    name : data.Name,
                    surname : data.Surname
                    })
                }).then(res => res.json())
                .then((res) => {
                    console.log(res);
                    setShowCPW(0); 
                    setLock(1); 
                    updatePersonalData()
                    })
            } catch(e){
                console.log("error in user page, submit phase: ", e);
            }
            setLock(1);
        }
        })
    }

    const onError = (e)=>{console.log("error in user page: ", e);}

    const modifyButton = <button onClick={()=>{setLock(0); setShowCPW(1)}}>Modify</button>
    const saveButtonComponent = (formMethods)=>{
        return(
            <>
            <button onClick={formMethods.handleSubmit(onSubmit, onError)}>Save</button>
            <button onClick={()=>{setShowCPW(0); setLock(1); updatePersonalData()}}>Abort</button>
            </>   
        )
    }

    const handleMailChange = (event) =>{setEmail(event.target.value)}

    return(
    <div className="user">
        <h1> Welcome to your home page </h1>
        <h1> {username} </h1>

        <div className={style.info} style={{display : showForm ? 'block' : 'none'}}>
            <FormProvider {...formMethods} >
                <Input
                label = {"Email"}
                type = "email"
                id = "email"
                placeholder={"email"}
                value={email}
                onInput={handleMailChange}
                isRequired = {0}
                readonly={lock}
                ></Input>

                <Input
                label = {"Bio"}
                type = "string"
                id = "Bio"
                value={bio}
                isRequired = {0}
                readonly={lock}
                onInput={(event)=>{setBio(event.target.value)}}
                ></Input>

                <Input
                label = {"Birthday"}
                type = "date"
                id = "birthday"
                value={birthday}
                isRequired = {0}
                readonly={lock}
                onInput={(event)=>{setBirthday(event.target.value)}}
                ></Input>

                <Input
                label = {"Name"}
                type = "string"
                id = "name"
                value={name}
                validationMessage={"please enter your surname"}
                readonly={lock}
                isRequired = {0}
                onInput={(event)=>{setName(event.target.value)}}
                ></Input>

                <Input
                label = {"Surname"}
                type = "string"
                id = "surname"
                value={surname}
                validationMessage={"please enter your surname"}
                readonly={lock}
                onInput={(event)=>{setSurname(event.target.value)}}
                ></Input>

                <div style={{display : showCPW ? "block" : "none" }}>
                    <Input
                    label = {"CPW"}
                    type = "password"
                    id = "CPW"
                    placeholder={"enter password to proceed"}
                    validationMessage={"enter password to proceed"}
                    onInput={(event)=>{setCPW(event.target.value)}}
                    isRequired={1}
                    ></Input>
                </ div>
                <button onClick={logout}>Logout</button>   
                { lock ? modifyButton : saveButtonComponent(formMethods)} 
            </FormProvider>
        </div>   
    </div>
)}

export default User;