const mongoose = require ('mongoose');
const express = require ('express');
const path = require ('path');
const { error } = require('console');
const { exitCode } = require('process');
const Users = require ("../mongoSchemas/UserSchemas.js")

exports.login = async function (req, res){
    let reqBody = req.body;
    console.log("recieved login request with body", reqBody.username, " ", reqBody.password);
    try{ 
        Users.find({username : reqBody.username, password : reqBody.password}, {username : 1, password : 1})
        .then( result =>{
            console.log("user find result: ",result);
            if(result.length){
                res.status(200).json({
                    message : "login successful",
                    username: reqBody.username
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