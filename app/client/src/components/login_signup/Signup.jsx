import React, {useState} from "react";
import LoginPage from './LoginPage.jsx';
import Registration from "./Registration.jsx";

function Signup({setting = 0, updateToken}){
    const [type, setType] = useState(setting);

    const loginForm= 
    <div className="">
        <LoginPage updateToken={updateToken}></LoginPage>
        <button onClick={() => setType(1)}>Register a new user</button>
    </div>

    const registrationForm =
    <div className="">
        <Registration updateToken={updateToken}></Registration>
        <button onClick={() => setType(0)}>Try to log in</button>
    </div>
        

    const formType = {
        0 : loginForm, 
        1 : registrationForm
    }

    return(
        <div className=""> 
            {formType[type]}
        </div>
    );

    
}

export default Signup;
