const express = require('express');
const { saveEvent, updateEvent, removeEvent, getEvent, allEvent, toggleComplete } = require('../controllers/eventController');
const eventRouter = express.Router();

eventRouter.post('/save', saveEvent);
eventRouter.put('/update/:id', updateEvent);
eventRouter.delete('/remove/:id', removeEvent);
eventRouter.get('/get/:id', getEvent);
eventRouter.get('/all', allEvent);
eventRouter.put('/toggle-complete/:id', toggleComplete);

module.exports = eventRouter;