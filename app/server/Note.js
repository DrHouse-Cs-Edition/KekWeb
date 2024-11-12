const mongoose = require ('mongoose');

const noteSchema = new mongoose.Schema({
    title: String,
    text: String,
    date: Date,
});

module.exports = new mongoose.model("Note", noteSchema)