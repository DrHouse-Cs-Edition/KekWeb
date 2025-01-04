const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    password: String, // per ora tipo String, poi vediamo cosa fanno le librerie "password1!" -> "2ashvd&%fewf&//°Lè&"
    email: String,
    bio: String,
    birthday: Date,
    // _id lo da già mongoDB (e viene usato come chiave esterna da altri Schema)
});

module.exports = new mongoose.model("User", userSchema);