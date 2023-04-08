const { body, query, param } = require('express-validator');

exports.questionSchema = [
    query('tag')
        .exists()
        .withMessage('tag is required')
];

exports.faqPostSchema = [
    body('answers')
        .notEmpty()
        .withMessage('answers are required!'),
    body().custom((body) => {
        const allowedKeys = [
                "answers",
                "ga_email",
                "alexa_email"
        ];
        for (const key of Object.keys(body)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key}`);
            }
        }
        return true;
    })
];

exports.createSchema = [
    body('answers')
        .isArray()
        .exists()
        .withMessage('answers is required'),
    body('answers.*')
        .isObject()
        .withMessage('Invalid answers'),
    body('answers.*.qn_id')
        .exists()
        .withMessage('question id is required'),
    body('answers.*.question')
        .exists()
        .withMessage('question is required'),
    body('answers.*.answer')
        .exists()
        .withMessage('answer is required'),
    body().custom((body) => {
        const allowedKeys = [
            "answers",
            "ga_email",
            "alexa_email"
        ];
        for (const key of Object.keys(body)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key}`);
            }
        }
        return true;
    })
];

exports.getHistorySchema = [
    query('tag')
        .exists()
        .withMessage('tag is required'),
    query('service')
        .exists()
        .withMessage('service is required')
]

exports.createQnsSchema = [
    body().isArray(),
    body('*.question')
        .exists()
        .withMessage('question is required'),
    body('*.type')
        .exists()
        .withMessage('question type is required')
]

exports.getUsersSchema = [
    body('ga_email')
        .exists()
        .withMessage('ga_email is required'),
    body().custom((body) => {
        const allowedKeys = [
            "ga_email"
        ];
        for (const key of Object.keys(body)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key}`);
            }
        }
        return true;
    })
];

exports.getQnSchema = [
    query().custom((query) => {

        const allowedKeys = [
            "type"
        ];
        for (const key of Object.keys(query)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key}`);
            }
        }

        return true;
    })
];

exports.createQnSchema = [
    body('question')
        .exists()
        .withMessage('question is required'),
    body('type')
        .exists()
        .withMessage('question type is required')
];

exports.editQnSchema = [
    body('id')
        .exists()
        .withMessage('question id is required'),
    body('question')
        .exists()
        .withMessage('question is required'),
    body('type')
        .exists()
        .withMessage('question type is required')
];

exports.popupCheckSchema = [
    query('qn_type_name')
    .exists()
    .withMessage('The name of the question type is required as a parameter!'),
    query().custom((query) => {

        const allowedKeys = [
            "qn_type_name"
        ];
        for (const key of Object.keys(query)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key}`);
            }
        }

        return true;
    })
];

exports.getQnTypeSchema = [
    query().custom((query) => {

        const allowedKeys = [
            "id",
            "name"
        ];
        for (const key of Object.keys(query)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key}`);
            }
        }

        return true;
    })
];

exports.getAnswerQnTypeSchema = [
        query('service')
        .exists()
        .withMessage('service is required!'),
    query().custom((query) => {

        const allowedKeys = [
            "id",
            "name",
            "tag",
            "from",
            "to",
            "service"
        ];
        for (const key of Object.keys(query)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key} please resolve`,query);
            }
        }

        return true;
    })
];

exports.createQnTypeSchema = [
    body('name')
        .exists()
        .withMessage('name is required'),
    body('link')
        .exists()
        .withMessage('link is required')
];

exports.editQnTypeSchema = [
    body('id')
        .exists()
        .withMessage('id is required'),
    body('name')
        .exists()
        .withMessage('name is required'),
    body('link')
        .exists()
        .withMessage('link is required')
];

exports.deleteQnTypeSchema = [
    param('id')
        .exists()
        .withMessage('id is required')
];