const express = require('express');
const { saveEvent, updateEvent, removeEvent, getEvent, allEvent, toggleComplete ,isPomodoroScheduled, movePomodoros, latestP } = require('../controllers/eventController');
const eventRouter = express.Router();

module.exports = (timeShift) => {

    eventRouter.post('/save', (req, res) => saveEvent(req, res, timeShift));
    eventRouter.put('/update/:id', updateEvent); // modify?
    eventRouter.delete('/remove/:id', removeEvent);
    eventRouter.get('/get/:id', getEvent);
    eventRouter.get('/all', allEvent);
    eventRouter.get("isPomodoroScheduled", isPomodoroScheduled);
    eventRouter.put('/toggle-complete/:id', toggleComplete);
    eventRouter.get("/latestP", latestP );

    return eventRouter;
};