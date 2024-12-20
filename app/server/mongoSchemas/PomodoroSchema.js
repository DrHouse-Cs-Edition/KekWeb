const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const path = require ('path');

const pomodoroSchema = new Schema({
    //User : String,
    title: String,
    studyTime : Number,
    breakTime : Number,
    cycles : Number
});

module.exports = new mongoose.model("Pomodoro", pomodoroSchema);