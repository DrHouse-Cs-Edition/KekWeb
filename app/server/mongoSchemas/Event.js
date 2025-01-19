const mongoose = require ('mongoose');

const eventSchema = new mongoose.Schema({ // uso standard Icalendar (per poter creare file ics)
    title: String,
    description: String,
    start: Array, // [YYYY, MM, DD, HH, mm] da standard Icalendar
    end: Array, // oppure "duration: Object"
    // per durata tutto il giorno: non devi mettere ora in end (e in start non serve)
    recurrenceRule: String, // valori = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" (o altri + dettagliati)
    alarms: Array, // ognuno ha [action:String,  trigger:Number,  description:String] con action = "audio" | "display" | "email"
    location: String,
    // geo: Object = coordinate
});

module.exports = new mongoose.model("Note", eventSchema)