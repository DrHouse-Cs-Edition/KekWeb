const mongoose = require ('mongoose');
const express = require ('express');
const path = require ('path');
const { error } = require('console');
const { exitCode } = require('process');

exports.login = async function (req, res){
    let reqBody = req.body;
    console.log("recieved login request with body", reqBody);
    try{ 
        res.json({
        username: reqBody.username,
        password: reqBody.password
    });
    } catch (error) {
        console.log("error is: ", error);
    }
}