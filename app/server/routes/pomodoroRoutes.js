const express = require('express');
const pomodoroController = require('../controllers/pomodoroController.js');
const {isPomodoroScheduled} = require("../controllers/eventController.js")
const pomodoroRouter = express.Router();

pomodoroRouter.post("/saveP", pomodoroController.saveP);
pomodoroRouter.get("/getP", pomodoroController.getP);
pomodoroRouter.post("/renameP", pomodoroController.renameP);
pomodoroRouter.delete("/deleteP/:id", pomodoroController.deleteP);
pomodoroRouter.post("/cyclesUpdate", isPomodoroScheduled, pomodoroController.subCycles);
pomodoroRouter.post("/updateP", pomodoroController.updateP);

module.exports = pomodoroRouter;