const express = require('express');
const { saveEvent, getEvent, removeEvent, updateEvent } = require('../controllers/eventController');
const eventRouter = express.Router();

eventRouter.get('/save', saveEvent);
eventRouter.post('/get', getEvent);
eventRouter.post('/remove', removeEvent);
eventRouter.put('/update', updateEvent);

module.exports = eventRouter;