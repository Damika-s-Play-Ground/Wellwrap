const { body } = require('express-validator');

exports.createSchema = [
    body('bp')
        .exists()
        .withMessage('bp is required'),
    body('temp')
        .exists()
        .withMessage('temp is required'),
    body('timestamp')
        .exists()
        .withMessage('timestamp is required'),
];

exports.updateSchema = [
    body('bp')
        .exists()
        .withMessage('bp is required'),
    body('temp')
        .exists()
        .withMessage('temp is required'),
    body('timestamp')
        .exists()
        .withMessage('timestamp is required'),
];