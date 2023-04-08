const express = require('express');
const painController = require('../controllers/pain.controller');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createSchema, updateSchema } = require('../middleware/validators/painValidator.middleware');

const router = express.Router({
    mergeParams:true
});

router.get('/', awaitHandlerFactory(painController.getUserPains.bind(painController)));
router.post('/', createSchema, awaitHandlerFactory(painController.create.bind(painController)));
router.patch('/:id', updateSchema, awaitHandlerFactory(painController.update.bind(painController)));
router.delete('/:id', awaitHandlerFactory(painController.delete.bind(painController)));

module.exports = router