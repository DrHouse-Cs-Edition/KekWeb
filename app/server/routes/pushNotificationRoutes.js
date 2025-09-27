const express = require('express');
const { subscribe, testNotication } = require('../controllers/pushNotificationController.js');
const Router = express.Router();

Router.post('/subscribe', subscribe);
Router.put('/testNotication', testNotication);

module.exports = Router;