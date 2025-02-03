const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    token : String,
    username: String
});

module.exports = new mongoose.model("RefreshToken", TokenSchema);