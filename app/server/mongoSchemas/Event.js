const mongoose = require ('mongoose');

const eventSchema = new mongoose.Schema({
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
    rrule: Object,
    nextAlarm: Date,
  });

module.exports = new mongoose.model("Event", eventSchema)