const express = require('express');
const { saveEvent, updateEvent, removeEvent, getEvent, allEvent } = require('../controllers/eventController');
const eventRouter = express.Router();

eventRouter.post('/save', saveEvent);
eventRouter.put('/update/:id', updateEvent);
eventRouter.delete('/remove/:id', removeEvent);
eventRouter.get('/get/:id', getEvent);
eventRouter.get('/all', allEvent);
eventRouter.get("isPomodoroScheduled", isPomodoroScheduled);

module.exports = eventRouter;