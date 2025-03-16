const path = require ('path');
const Users = require ("../mongoSchemas/UserSchemas.js");
const jwt = require("jsonwebtoken");
// const tokenSchema = require("../mongoSchemas/RTokenSchema.js")
require("dotenv").config();

const findUser = (username)=>{
    return Users.find({username : username}, {username : 1})
}

exports.login = async function (req, res){
    let {username, password} = req.body;
    try{ 
        findUser(username, password)
        .then( result =>{
            console.log("user find result: ",result);
            if(result.length){

                const token = jwt.sign({username : username}, process.env.JWT_KEY);
                // const R_token = jwt.sign({username : username}, process.env.JWT_REFRESH);

                // tokenSchema.create({username, token : token});
                // console.log("created a new refresh token")

                res.status(200).json({
                    message : "login successful",
                    token: token,
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
        findUser(username)   //find same user
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
                const token = jwt.sign({username : username}, process.env.JWT_KEY);
                res.json({
                    success: true,
                    token : token,
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
    console.log("user ", decoded.username, "has been succesfully authenticated with return ", decoded);
        next(); 
        }   
    )
}

// exports.refreshToken = function (req, res){
//     const body = req.body;
//     const refreshToken = body?.token;

//     if(!refreshToken)
//         return res.status(401).json({
//             message: "No token provided",
//             success : false
//         })
//     tokenSchema.find({token : refreshToken}, {token : 1})
//     .then(result => {
//         if(result.length === 0)
//             return res.status(403).json({
//             success: false,
//             message: "Invalid token"
//             })
//         console.log("refresh token has been succesfully verified");
//          return newToken = jwt.sign({name : result[0].username}, process.env.JWT_KEY, {expiresIn: '30m'});
//         })
//     .then( newToken =>{
//         res.status(200).json({token : newToken, 
//             message : "Token has been refreshed"
//         })
//     })
// }

exports.logout = function (req, res){
    const body = req.body;
    username = body.username;
    console.log("provided username for delete is: ", username);

    if(!username)
        res.status(401).json({
            message: "No username provided",
            success : false
        })
    console.log("token exists, searching");
    tokenSchema.deleteMany({username : username})
    .then(result => {
        if(result.length === 0)
            res.status(403).json({
            success: false,
            message: "Invalid username"
            })
        console.log("refresh token has been succesfully deleted: ", result);
        res.status(200).json({
            success: true,
            message: "You have been logged out"
        })
    })
}

exports.userData = function (req, res){
    //*function uses request parameters for sending desired user data to client. Request tpye: GET
    const query = req.query;
    const user = Users.find(req.user);

    res.json({
        success: true,
        email : Users.find({username : username}, {username : 1})
        bio : b, 
        birthday : bd, 
        realName : rn, 
        realSurname : rs
    })
}