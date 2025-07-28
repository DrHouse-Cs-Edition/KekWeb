import { useEffect, useRef, useState } from "react";
import { useUsername, UseToken, getPersonalData, checkPassword } from "../components/login_signup/UserHooks";
import {FormProvider, useForm} from "react-hook-form";
import FileBase64 from "react-file-base64"

import { Input } from "../utils/InputV2"
import style from "./User.module.css";

const User = ()=>{
    const formMethods = useForm();

    const {username, setUsername} = useUsername();
    const {token, setToken} = UseToken();

    //*********** Rendered Data ***********/
    const [email, setEmail] = useState(); const [bio, setBio] = useState(); const [birthday, setBirthday] = useState(); const [name, setName] = useState();
    const [surname, setSurname] = useState(); const [lock, setLock] = useState(1); const [CPW, setCPW] = useState(); const [PFP, setPFP] = useState()
    const [image, setImage] = useState();
    const [imageObj, setImageObj] = useState();

    const [showForm, setShowForm] = useState(0);
    const [showCPW, setShowCPW] = useState(0);
    const [attempts, setAttempts] = useState(0);


    //esegui il logout dell'utente
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
            .then((res)=>{              
                setToken({token : ""});
                setUsername("");  
                window.location.reload(false);
            })
        }catch(e){
            console.log("error in user page, logout phase: ", e);
        }  
    }

    useEffect(()=>{
        console.log("image is ", image);
        console.log("PFP is: ", PFP);
    }, [image, PFP])


    //apporta modifiche in base ai dati presenti nei form; è presente una password di conferma prima di effettuare queste modifiche 
    const onSubmit =  (data) =>{
        checkPassword(username, CPW, (result) => {
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
                    surname : data.Surname,
                    picture : image?.base64, //image base 64 encoded
                    pictureTile : image?.name
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

    //gestisci errori alla richiesta di salvataggio modifiche
    const onError = (e)=>{console.log("error in user page: ", e);}

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

    const modifyButton = <button onClick={()=>{setLock(0); setShowCPW(1)}} className={style.Button}>Modify</button>
    const saveButtonComponent = (formMethods)=>{
        return(
            <>
            <button onClick={formMethods.handleSubmit(onSubmit, onError)} className={style.Button}>Save</button>
            <button onClick={()=>{updatePersonalData(); setLock(1)}} className={style.Button}>Abort</button>
            </>   
        )
    }
    const FullForm = ()=>{
        return (<FormProvider {...formMethods} >

                <img src={image?.base64} alt="preview image" className={style.image}/>
                <FileBase64 multiple={false}
                onDone={setImage}/>
                
                <Input
                label = {"Email"}
                type = "email"
                id = "email"
                placeholder={"email"}
                value={email}
                onInput={(event)=>{setEmail(event.target.value)}}
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
                validationMessage={"please enter your name"}
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

                <Input
                label = {"CPW"}
                type = "password"
                id = "CPW"
                placeholder={"enter password to proceed"}
                validationMessage={"enter password to proceed"}
                onInput={(event)=>{setCPW(event.target.value)}}
                isRequired={1}
                ></Input>   
                { lock ? modifyButton : saveButtonComponent(formMethods)} 
            </FormProvider>)
    }
    

    const userPage = ()=> {

        return(
            <div className={style.dataDiv}>
                <img src={image?.base64} alt="preview image" className={style.image}/>
                <div>
                    <div className={style.dataLabel}>
                        Name:
                        <div className={style.data}>{name}</div>
                    </div>
                    <div className={style.dataLabel}>
                        Surname: <div className={style.data}>{surname}</div>
                    </div>
                    <div className={style.dataLabel}>
                        Birthday: <div className={style.data}>{birthday}</div>
                    </div>
                    <div className={style.dataLabel}>
                        email: <div className={style.data}>{email}</div>
                    </div>
                    <div className={style.dataLabel}>
                        Bio: <div className={style.data}>{bio}</div>
                    </div>
                </div>
            </div>
        )

    }
     

    return(
    <div className={style.userBody}>
        <h1 className={style.welcome}> Welcome to your home page {username} </h1>
        {
            !showForm ? userPage() : FullForm()
        }

        {!showForm ? 
            <button onClick={()=>{setShowForm(1)}} className={style.Button}>Modify your data</button>
        :
            <button onClick={()=>{setShowForm(0)}} className={style.Button}>Back to your home page</button>
        }

        <button onClick={logout} className={style.Button_logout}>Logout</button>
    </div>
    )
}

export default User;