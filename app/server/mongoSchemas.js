const mongoose = require ('mongoose');

const noteSchema = new mongoose.Schema({
    title: String,
    text: String,
    date: Date,
});

module.exports = new mongoose.model("Note", noteSchema);

const pomodoroSchema = new mongoose.Schema({
    //User : String,
    title: String,
    study : Number,
    break : Number,
    cycles : Number
});

module.exports = new mongoose.model("Pomodoro", pomodoroSchema);