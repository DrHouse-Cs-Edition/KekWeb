const mongoose = require ('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    start: Date, // contiene anche hour
    //hour:
    end: Date, // idea: fine durata attività
    // frequency: 
    //repetitions:
    //place:
    alert: Boolean, // se allertare
    //alert_anticipation:
    //alert_repetition:

    
    // _id è in id univoco dato da mongonDB
});

module.exports = new mongoose.model("Note", eventSchema)