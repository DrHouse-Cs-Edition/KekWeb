const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const path = require ('path');

const pomodoroSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, // Specifica che è un ObjectId
        ref: 'User', // Nome del modello a cui fa riferimento
        // required: true, // OBBLIGA ad avere un campo user alle note
    },
    title: String,
    studyTime : Number,
    breakTime : Number,
    cycles : Number,
});

module.exports = new mongoose.model("pomodoro", pomodoroSchema);