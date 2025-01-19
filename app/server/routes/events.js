const express = require('express');
const { saveEvent, getEvent, removeEvent, updateEvent } = require('../controllers/eventController');
const events = express.Router();

events.get('/save', saveEvent);
events.post('/get', getEvent);
events.post('/remove', removeEvent);
events.put('/update', updateEvent);

module.exports = events;