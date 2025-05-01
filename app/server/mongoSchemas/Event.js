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
    rrule: Object,
    nextAlarm: Date,
    user: { 
      type: Schema.Types.ObjectId, // Specifica che è un ObjectId
      ref: 'User', // Nome del modello a cui fa riferimento
    },
});

module.exports = mongoose.model("Event", eventSchema);