const mongoose = require ('mongoose');

const eventSchema = new mongoose.Schema({ // uso standard Icalendar (per conversione in ics usa libreria ics.js)
    title: String,
    description: String,
    location: String,
    start: Date,
    end: Date, // per durata tutto il giorno: non devi mettere ora in end (e in start non serve)
    rrule: Object,
    /*
        freq: Can be DAILY, WEEKLY, MONTHLY, or YEARLY.
        interval: The interval of freq to recur at. For example, if freq is WEEKLY and interval is 2, the event will repeat every 2 weeks. Must be an integer.
        byweekday: Which days of the week the event is to occur. An array containing any of SU, MO, TU, WE, TH, FR, SA.
        dtstart: 
        until: A date string representing the date on which to end repetition. Must be friendly to Date()
    */
    alarm: Object,
    /*
        earlyness: quanto prima (minuti)
        repeat_times: number
        repeat_every: minutes
    */
    //extra
    nextAlarm: Date,
    repeated: Number,
});

module.exports = new mongoose.model("Event", eventSchema)