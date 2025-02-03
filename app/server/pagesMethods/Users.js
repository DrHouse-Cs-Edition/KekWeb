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
            console.log("user find result: ",result);
            if(result.length){
                const name = {username : username};

                const token = jwt.sign(name, process.env.JWT_KEY,{ expiresIn: 60 * 30});
                const R_token = jwt.sign(name, process.env.JWT_REFRESH);

                tokenSchema.create({username : name, token : R_token});
                console.log("created a new refresh token")

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
    console.log("recieved registration request with data ", reqBody);
    let {username, password} = reqBody;

    try{
        findUser(username, password)   //find same user
        .then(result =>{
            console.log("result of user search yielded ", result);
            if(result.length){
                console.log("user already exists");
                res.status(400).json({
                    success: false,
                    message: "User already exists"
                });
            }else{
                console.log("registration in process");
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
        console.log("user ", decoded.username, "has been succesfully authenticated with return ", decoded);
        if(err)
            return res.status(403).json({
                success: false,
                message: "Invalid token"
            });
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
        console.log("refresh token has been succesfully verified");
         return newToken = jwt.sign({name : result[0].username}, process.env.JWT_KEY, {expiresIn: '30m'});
        })
        .then( newToken =>{
            res.status(200).json({token : newToken, 
                message : "Token has been refreshed"
            })
        })
}

exports.deleteToken = function (req, res){
    const body = req.body;
    const refreshToken = body?.token;

    if(!refreshToken)
        return res.status(401).json({
            message: "No token provided",
            success : false
        })
    tokenSchema.remove({token : refreshToken})
    .then(result => {
        if(result.length === 0)
            return res.status(403).json({
            success: false,
            message: "Invalid token"
            })
        console.log("refresh token has been succesfully deleted: ", result);
    })
}