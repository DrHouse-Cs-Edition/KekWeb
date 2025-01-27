const path = require ('path');
const Users = require ("../mongoSchemas/UserSchemas.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const findUser = (username, password)=>{
    return Users.find({username : username, password : password}, {username : 1, password : 1})
}

exports.login = async function (req, res){
    let {username, password} = req.body;
    console.log("recieved login request with body", username, " ", password);
    try{ 
        findUser(username, password)
        .then( result =>{
            console.log("user find result: ",result);
            if(result.length){
                console.log("creating session token from envVar: ", process.env.JWT_KEY);
                const token = jwt.sign({username : username}, process.env.JWT_KEY, { expiresIn: 60 * 30});
                res.status(200).json({
                    message : "login successful",
                    token: token 
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

    try{
        Users.find({username : reqBody.username}, {username : 1})   //find same user
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