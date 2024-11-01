import React, {useState} from "react";

function Signup(){
    const [email, SetEmail] = useState("");
    const [password, SetPassword] = useState("");
    const [confPassword, SetConfPassword] = useState("");

    return(
        <div>
            <h2>Login</h2>
            <form>
                <input 
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => SetEmail(e.target.value)}
                required
                />
                <input 
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => SetPassword(e.target.value)}
                required
                />
                <input 
                type="password"
                placeholder="Confirm password"
                value={confPassword}
                onChange={(e) => SetConfPassword(e.target.value)}
                required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Signup;
