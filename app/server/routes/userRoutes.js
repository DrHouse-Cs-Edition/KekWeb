const express = require('express');
const userController = require('../controllers/userController.js');
const userRouter = express.Router();

userRouter.get("/getData", userController.userData );
userRouter.put("/updateUData", userController.updateDataV2);
userRouter.put("/updateNotificationMethod", userController.updateNotificationMethod);

module.exports = userRouter;