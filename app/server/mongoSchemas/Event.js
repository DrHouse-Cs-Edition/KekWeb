const mongoose = require('mongoose');
const { Schema } = mongoose; // Estrai Schema da mongoose

const eventSchema = new Schema({
    type: {
      type: String,
      enum: ['event', 'activity', 'pomodoro'],
      default: 'event'
    },
    title: String,
    description: String,
    location: String,
    // For regular events and activities
    start: Date,
    end: Date,
    // For activities (date without time)
    activityDate: Date,
    // For pomodoro
    cyclesLeft: Number,
    // For recurring events
    recurrenceRule: String,
    /*rrule: Object, // RRULE PIU LEGGIBILE DAL SERVER -> CONTROLLARE SE DAREBBE CONFLITTI !!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
    user: { 
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true // Add validation
    },
});

module.exports = mongoose.model("Event", eventSchema);