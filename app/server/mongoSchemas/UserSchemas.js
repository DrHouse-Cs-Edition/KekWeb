const mongoose = require ('mongoose');
const PomodoroSchema = require("./PomodoroSchema.js");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: String,
    password: String, // per ora tipo String, poi vediamo cosa fanno le librerie "password1!" -> "2ashvd&%fewf&//°Lè&"
    email: String,
    bio: String,
    birthday: Date,
    realName : String,
    realSurname : String,
    // _id lo da già mongoDB (e viene usato come chiave esterna da altri Schema)
});

module.exports = new mongoose.model("User", userSchema);