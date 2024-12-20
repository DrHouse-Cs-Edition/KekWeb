const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: String,
    text: String,
    date: Date,
});

module.exports = new mongoose.model("Note", noteSchema);