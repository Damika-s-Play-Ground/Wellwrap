const { body } = require('express-validator');

exports.createSchema = [
    body('pain_number')
        .exists()
        .withMessage('pain_number is required'),
    body('timestamp')
        .exists()
        .withMessage('timestamp is required'),
];

exports.updateSchema = [
    body('pain_number')
        .exists()
        .withMessage('pain_number is required'),
    body('timestamp')
        .exists()
        .withMessage('timestamp is required'),
];