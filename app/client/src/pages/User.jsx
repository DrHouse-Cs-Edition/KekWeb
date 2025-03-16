import { useEffect, useState } from "react";
import { useUsername, UseToken, getPersonalData } from "../components/login_signup/UserHooks";
import style from "./User.module.css";

const updatePersonalData = ()=>{
    const params = new URLSearchParams([["email" , 1], ["bio", 1], ["birthday", 1], ["realName", 1], ["realSurname", 1]]);
    console.log("parameters client side are ", params.toString());
    return getPersonalData(params);
}

const User = ()=>{
    const {username, setUsername} = useUsername();
    const {token, setToken} = UseToken();
    const [email, setEmail] = useState();
    const [bio, setBio] = useState();
    const [birthday, setBirthday] = useState();
    const [realName, setName] = useState();
    const [realSurname, setSurname] = useState();


    useEffect(()=>{
        let {email : e, bio : b, birthday : bd, realName : rn, realSurname : rs}= updatePersonalData();
        setEmail(e);
        setBio(b);
        setBirthday(bd);
        setName(rn);
        setSurname(rs);
        console.log(email);
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
        }  
    }

    return(
        <div className="user">
            <h1> Welcome to your home page </h1>
            <h1> {username} </h1>

            <div className={style.info} > 
                <p> Email: {email} </p>
                <p> Bio: {bio} </p>
                <p> Birthday: {birthday} </p>
                <p> Name: {realName} </p>
                <p> Surname: {realSurname} </p>
            </div>

            <button onClick={logout}>Logout</button>
            
        </div>
    )
}

export default User;