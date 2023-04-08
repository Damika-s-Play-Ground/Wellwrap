const express = require('express');
const userController = require('../controllers/user.controller');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const router = express.Router({
    mergeParams:true
});

router.get('/', awaitHandlerFactory(userController.getCategories));

module.exports = router;