const Users = require ("../mongoSchemas/UserSchemas.js");
const jwt = require("jsonwebtoken");
const tokenSchema = require("../mongoSchemas/RTokenSchema.js")

exports.login = async function (req, res){
    let {username, password} = req.body;
    try{ 
        const result = await Users.find({username : username, password : password}, {username : 1, password : 1})
        if(result.length){
            const token = jwt.sign({username : username, id: result[0]._id}, process.env.JWT_KEY);
            // const R_token = jwt.sign({username : username, id: result[0]._id}, process.env.JWT_REFRESH);

            tokenSchema.create({username, token : token});

            res.cookie("accessToken", token, {
                httpOnly: true,
                sameSite: "strict",
            });
            res.status(200).json({ // ***************************************************************** nel caso è DA ELIMINARE (e modificare client di conseguenza)
                message : "login successful",
                token: token
                // refreshToken : token 
            })
        }else{
            res.status(401).json({
                message: "Invalid username or password",
                success: false
            })
        }
    }
    catch(e){
        console.log("error in login ", e);
    }
}

exports.registration = async function (req, res){
    let reqBody = req.body;
    let {username, password} = reqBody;

    try{
        const result = await Users.find({username : username})
        if(result.length){
            res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }else{
            Users.create(reqBody);
            res.json({
                success: true,
                message: "User created successfully"
            })
        } 
    }catch(e){
        console.log("error creating a new User: ", e);
    }
}

exports.authToken = function (req, res, next){ // middleware
    const token = req?.cookies.accessToken;
    if (!token){
        return res.status(401).json({ message: "Manca cookie token" });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if(err)
            return res.status(403).json({
                success: false,
                message: "Invalid token"
            });
        // salvare nome utente e id per API
        req.user = decoded.id; // Aggiunge username alla req passata dopo middleware
        }   
    )
    next(); 
}
/*
exports.refreshToken = function (req, res){
    const body = req.body;
    const refreshToken = body?.token;

    if(!refreshToken)
        return res.status(401).json({
            message: "No token provided",
            success : false
        })
    tokenSchema.find({token : refreshToken}, {token : 1})
    .then(result => {
        if(result.length === 0)
            return res.status(403).json({
            success: false,
            message: "Invalid token"
            })
         return newToken = jwt.sign({name : result[0].username}, process.env.JWT_KEY, {expiresIn: '30m'});
        })
    .then( newToken =>{
        res.status(200).json({token : newToken, 
            message : "Token has been refreshed"
        })
    })
} */

exports.logout = function (req, res){

    const token = req?.cookies.accessToken;
    if (!token)
        return res.send().json({ message: "Connessione già scaduta" });

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) =>{ // deduco l'utente che cerca di fare il logout (decoded.username)
        tokenSchema.deleteOne({username : decoded.username})
        .then(result => {
            if(result.length === 0)
                res.status(403).json({
                success: false,
                message: "no token for the username found"
                })
            // faccio eliminare i cookies al client
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            
            res.status(200).json({
                success: true,
                message: "You have been logged out"
            })
        })
    });
    
}