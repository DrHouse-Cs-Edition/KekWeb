const mongoose = require ('mongoose');

const eventSchema = new mongoose.Schema({ // uso standard Icalendar (per conversione in ics usa libreria ics.js)
    subject: String,
    description: String,
    location: String,
    start: Date,
    end: Date, // per durata tutto il giorno: non devi mettere ora in end (e in start non serve)
    rrule: Object,
    /*parametri di rrule:
        freq : Required. The frequency of event recurrence. Can be DAILY, WEEKLY, MONTHLY, or YEARLY.
        until : A date string representing the date on which to end repitition. Must be friendly to Date()
        count : Alternative to until. Repeat the event count times. Must be an integer
        interval : The interval of freq to recur at. For example, if freq is WEEKLY and interval is 2, the event will repeat every 2 weeks. Must be an integer.
        byday : Which days of the week the event is to occur. An array containing any of SU, MO, TU, WE, TH, FR, SA.
    */
    nextAlarm: Date,
});

module.exports = new mongoose.model("Event", eventSchema)