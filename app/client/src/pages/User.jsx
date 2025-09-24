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
    const [notifications, setNotifications] = useState();


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
                    window.alert("dati modificati");
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
        const params = new URLSearchParams([["email" , 1], ["bio", 1], ["birthday", 1], ["name", 1], ["surname", 1], ["picture", 1], ["notifications", 1]]); // se ho 1 -> ritorna il dato
        getPersonalData(params)
        .then(data => data.json())
        .then((data) =>{
            let {email : e, bio : b, birthday : bd, name : rn, surname : rs, picture : p, notifications : ntf} = data;
            setEmail(e);
            setBio(b);
            const dateArr = bd?.split("T");
            setBirthday(dateArr ? dateArr[0] : null);
            setName(rn);
            setSurname(rs);
            setImageCallback(p);
            setNotifications(ntf);
        })
    }

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
                <img src={image? image : "/utenteGenerico.png"} alt=" " className={style.image}/>
                <FileBase64 multiple={false}
                label = {"Immagine Profilo:"}
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
                <img src={image? image : "/utenteGenerico.png"} alt=" " className={style.image}/>
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

    // PUSH NOTIFICATIONS
    const publicVapidKey = 'BCYGol-mf-Dw5Ns46eA-yK5XgtF0sPGloXOjHLzaqA3RhsO9BONM-D1LNA7-iPHD-eY9KWb_7xD7mV12WfVwE2c';

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }

    const handleSubscribe = async (alertIfEnabled = true) => {
        if ('serviceWorker' in navigator && 'PushManager' in window) { // serviceWorker = registra lo script di background | PushManager = crea il "canale" per inviare notifiche
            try{
                console.log("A");
                // 0. controllo non ci sia già subscription
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.getSubscription();
                console.log("B");
                if(sub){
                    if(alertIfEnabled)
                        alert("notifiche push già abilitate su questo dispositivo");
                }
                else{ // continua

                    // 1. Richiesta permesso all'utente
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        alert('Permesso negato!');
                    return;
                    }

                    // 2. Registrazione Service Worker
                    const register = await navigator.serviceWorker.register('/sw.js', { // registra service worker (salvato in public)
                    scope: '/', // scope = tutto il sito
                    });

                    // 3. Iscrizione al Push Manager
                    const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true, // le mostra all'utente (obbligatorio)
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey), // public key per riconoscere server
                    });

                    // 4. Invio iscrizione al server
                    await fetch('http://localhost:5000/api/pushNotifications/subscribe', {
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify(subscription),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    });

                    alert('Notifiche attivate!');
                }
            }
            catch (err) {
                console.error('Errore iscrizione:', err);
            }
        }else {
            alert('Il browser non supporta le notifiche push.');
        }
    };

    const handleUnsubscribe = async () => {
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();

            if (sub){
                await sub.unsubscribe();
                alert("Dispositivo disiscritto alle notifiche di push");
            }
        } catch (err) {
            console.error("Errore unsubscribe:", err);
        }
    };

    const receiveNotification = async () => {
        await fetch('http://localhost:5000/api/pushNotifications/notify', {
            method: 'PUT',
            credentials: 'include',
        });
    }

    const updateNotificationMethod = async (value) => {
        if( value == "email" && email === false ){
            alert("se vuoi ricevere notifiche via mail devi prima inserire una mail!");
            notifications = "disabled";
            return;
        }

        if(value == "push"){
            const alertIfEnabled = false;
            await handleSubscribe(alertIfEnabled);
        }
        
        try {
            await fetch("http://localhost:5000/api/user/updateNotificationMethod",{
                method : "PUT",
                headers:{ 'Content-Type': 'application/json' },
                body : JSON.stringify({
                    notifications: notifications
                })
            });
            window.alert("Metodo di notifica modificato");
        } catch(e){
            console.log("errore update subscription al server: ", e);
        }
    }

    //update personal data on component render
    useEffect(()=>{
        updatePersonalData();
    }, [])

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

        <div>
            <h1 className={style.TitleNotifications}>Notifiche</h1>
            <div>
                <label>Scegli un'opzione di notifica:</label>
                <select
                    className={style.selectorNote}
                    value={notifications}
                    onChange={(e) => setNotifications(e.target.value)}
                >
                    <option value="disabled">Disattivate</option>
                    <option value="email">Via email</option>
                    <option value="push">Notifiche push</option>
                </select>

                <button className={style.Button} onClick={() => updateNotificationMethod(notifications)}>Conferma metodo di notifica</button>
            </div>

            {notifications == "push" && (
                <div>
                    <button className={style.Button} onClick={handleSubscribe}>Permetti Notifiche Push</button>
                    <button className={style.Button} onClick={() => handleUnsubscribe()}>Disattiva notifiche Push sul dispositivo</button>
                </div>
            )}

        </div>
    </div>
    )
}

export default User;