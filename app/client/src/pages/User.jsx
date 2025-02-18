import { useUsername, UseToken } from "../components/login_signup/UserHooks";

const User = ()=>{
    const {username, setUsername} = useUsername();
    const {token, setToken} = UseToken();

    const logout = ()=>{
        try{
        console.log("token is-s-s ", username);
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
                console.log("logout res ", res);
                setToken({token : ""});
                setUsername("");  
                window.location.reload(false);
            })
        }catch(e){
            console.log(e);
        }  
    }

    return(
        <div className="user">
            <h1> Welcome to your home page </h1>
            <h1> {username} </h1>

            <button onClick={logout}>Logout</button>
            
        </div>
    )
}

export default User;