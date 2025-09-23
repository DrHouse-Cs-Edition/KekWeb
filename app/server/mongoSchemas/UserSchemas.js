const mongoose = require ('mongoose');
const PomodoroSchema = require("./PomodoroSchema.js");
const { buffer } = require('stream/consumers');
const { type } = require('os');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    // _id lo da già mongoDB (e viene usato come chiave esterna da altri Schema)
    username: String,
    password: String, // per ora tipo String, poi vediamo cosa fanno le librerie "password1!" -> "2ashvd&%fewf&//°Lè&"
    email: String,
    bio: String,
    birthday: Date,
    name : String,
    surname : String,
    picture :  String,
    notifications : String, // disabled | email | push
});

module.exports = new mongoose.model("User", userSchema);