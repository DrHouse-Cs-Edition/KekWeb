const express = require('express');
const { saveEvent, getEvent, removeEvent, updateEvent } = require('../controllers/eventController');
const events = express.Router();

router.get('/save', saveEvent);
router.post('/get', getEvent);
router.post('/remove', removeEvent);
router.put('/update', updateEvent);

module.exports = events;