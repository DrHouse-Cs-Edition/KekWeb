import React, {useState} from "react";

function Login(){
    const [email, SetEmail] = useState("");
    const [password, SetPassword] = useState("");

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
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
