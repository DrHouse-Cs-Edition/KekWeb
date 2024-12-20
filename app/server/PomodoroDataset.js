const mongoose = require ('mongoose'); // per usare mongoDB su js

const PomodoroSchema = new mongoose.Schema({
    time: Number,
    numCycles: Number,
});

module.exports = new mongoose.model("PomodoroDataset", PomodoroSchema)