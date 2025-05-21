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
    nextAlarm: Date,
    user: { 
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true // Add validation
    },
});

module.exports = mongoose.model("Event", eventSchema);