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
    const [surname, setSurname] = useState(); const [CPW, setCPW] = useState();
    const [image, setImage] = useState();
    function setImageCallback(item){  //incoming image can either be a base64 or a string
        if(item)
            typeof item === "string" ? setImage(item) : setImage(item.base64);
    }

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

    // useEffect(()=>{
    //     console.log("image is ", image);
    // }, [image])


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
                    // bio : data.Bio,
                    bio : bio,
                    birthday : data.Birthday,
                    name : data.Name,
                    surname : data.Surname,
                    picture : image, //image base 64 encoded
                    })
                }).then(res => res.json())
                .then((res) => {
                    console.log(res);
                    setShowCPW(0); 
                    updatePersonalData()
                    })
            } catch(e){
                console.log("error in user page, submit phase: ", e);
            }
            }
        })
    }

    //gestisci errori alla richiesta di salvataggio modifiche
    const onError = (e)=>{console.log("error in user page: ", e);}

    //*FUNCTION GETS PERSONAL DATA FROM SERVER 
    const updatePersonalData = async ()=>{
        const params = new URLSearchParams([["email" , 1], ["bio", 1], ["birthday", 1], ["name", 1], ["surname", 1], ["picture", 1]]);
        getPersonalData(params)
        .then(data => data.json())
        .then((data) =>{
            let {email : e, bio : b, birthday : bd, name : rn, surname : rs, picture : p} = data;
            setEmail(e);
            setBio(b);
            const dateArr = bd?.split("T");
            setBirthday(dateArr ? dateArr[0] : null);
            setName(rn);
            setSurname(rs);
            setImageCallback(p);
        })
    }

    //update personal data on component render
    useEffect(()=>{
        updatePersonalData();
    }, [])

    const saveButtonComponent = (formMethods)=>{
        return(
            <>
            <button onClick={formMethods.handleSubmit(onSubmit, onError)} className={style.Button}>Save</button>
            <button onClick={()=>{updatePersonalData();}} className={style.Button}>Restore</button>
            </>   
        )
    }
    const FullForm = ()=>{
        return (
            <FormProvider {...formMethods} >
                <img src={image} alt="preview image" className={style.image}/>
                <FileBase64 multiple={false}
                onDone={setImageCallback}/>
                
                <Input
                label = {"Email"}
                type = "email"
                id = "email"
                placeholder={"email"}
                value={email}
                onInput={(event)=>{setEmail(event.target.value)}}
                isRequired = {0}
                ></Input>

                <div className={style.areaDiv}>
                    <label htmlFor={"bioTextArea"}> Bio</label> <br></br>
                    <textarea
                    id="bioTextArea"
                    className={style.BioField}
                    cols={40} rows={4}
                    value={bio} 
                    onInput={(event)=>{setBio(event.target.value)}} 
                    ></textarea>
                </div>

                <Input
                label = {"Birthday"}
                type = "date"
                id = "birthday"
                value={birthday}
                isRequired = {0}
                onInput={(event)=>{setBirthday(event.target.value)}}
                ></Input>

                <Input
                label = {"Name"}
                type = "string"
                id = "name"
                value={name}
                validationMessage={"please enter your name"}
                isRequired = {0}
                onInput={(event)=>{setName(event.target.value)}}
                ></Input>

                <Input
                label = {"Surname"}
                type = "string"
                id = "surname"
                value={surname}
                validationMessage={"please enter your surname"}
                onInput={(event)=>{setSurname(event.target.value)}}
                ></Input>

                <Input
                label = {"Confirm Password"}
                type = "password"
                id = "CPW"
                placeholder={"enter password to proceed"}
                validationMessage={"enter password to proceed"}
                onInput={(event)=>{setCPW(event.target.value)}}
                isRequired={1}
                ></Input>   
                {saveButtonComponent(formMethods)}
            </FormProvider>
        )
    }
    

    const userPage = ()=> {

        return(
            <div className={style.dataDiv}>
                <img src={image} alt="preview image" className={style.image}/>
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