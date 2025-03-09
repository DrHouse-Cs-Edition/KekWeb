const path = require ('path');
const Users = require ("../mongoSchemas/UserSchemas.js");
const jwt = require("jsonwebtoken");
const tokenSchema = require("../mongoSchemas/RTokenSchema.js")
require("dotenv").config();

const findUser = (username, password)=>{
    return Users.find({username : username, password : password}, {username : 1, password : 1})
}

exports.login = async function (req, res){
    let {username, password} = req.body;
    try{ 
        findUser(username, password)
        .then( result =>{
            if(result.length){

                const token = jwt.sign({username : username, id: result[0]._id}, process.env.JWT_KEY,{ expiresIn: "15s"});
                const R_token = jwt.sign({username : username, id: result[0]._id}, process.env.JWT_REFRESH);

                tokenSchema.create({username, token : token});

                res.status(200).json({
                    message : "login successful",
                    token: token,
                    refreshToken : R_token 
                })
            }else{
                res.status(401).json({
                    message: "Invalid username or password",
                    success: false
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: "Error in login request"})
            })
        } catch(e){
            console.log("error in login ", e);
        }
}

exports.registration = async function (req, res){
    let reqBody = req.body;
    let {username, password} = reqBody;

    try{
        findUser(username, password)   //find same user
        .then(result =>{
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
        })    
    }catch(e){
        console.log("error creating a new User: ", e);
    }
}

exports.authToken = function (req, res, next){
    const body = req?.body;
    const token = body?.token;

    if (!token){ return res.status(401).json({
        message: "No token provided",
        success : false
    })}

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if(err)
            return res.status(403).json({
                success: false,
                message: "Invalid token"
            });
        // salvare nome utente e id per API
        req.user = { ...decoded.id }; // Aggiunge username alla req passata dopo middleware
        
        next(); 
        }   
    )
}

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
}

exports.logout = function (req, res){
    const body = req.body;
    username = body.username;

    if(!username)
        res.status(401).json({
            message: "No username provided",
            success : false
        })
    tokenSchema.deleteMany({username : username})
    .then(result => {
        if(result.length === 0)
            res.status(403).json({
            success: false,
            message: "Invalid username"
            })
        res.status(200).json({
            success: true,
            message: "You have been logged out"
        })
    })
}