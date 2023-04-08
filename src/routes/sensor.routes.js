const express = require('express');
const sensorController = require('../controllers/sensor.controller');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createSchema, updateSchema } = require('../middleware/validators/sensorValidator.middleware');

const router = express.Router({
    mergeParams:true
});

router.get('/', awaitHandlerFactory(sensorController.getUserSensors.bind(sensorController)));
router.post('/', createSchema, awaitHandlerFactory(sensorController.create.bind(sensorController)));
router.patch('/:id', updateSchema, awaitHandlerFactory(sensorController.update.bind(sensorController)));
router.delete('/:id', awaitHandlerFactory(sensorController.delete.bind(sensorController)));

module.exports = router