const express = require('express');
const { subscribe, notify } = require('../controllers/pushNotificationController.js');
const Router = express.Router();

Router.post('/subscribe', subscribe);
Router.put('/notify', notify);

module.exports = Router;