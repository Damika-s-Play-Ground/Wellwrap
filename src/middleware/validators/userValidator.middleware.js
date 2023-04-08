const { body, checkSchema, query} = require('express-validator');

exports.validateUser = [
    body('email')
        .exists()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email')
        .normalizeEmail()
];

exports.updateSchema = [
    body().custom((body) => {

        if (Object.keys(body).length === 0) {
            throw new Error(`json request body can't be empty.`);
        }

        const allowedKeys = [
            "first_name",
            "last_name",
            "address",
            "mobile",
            "ga_email",
            "alexa_email",
            "language"
        ];
        for (const key of Object.keys(body)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key}`);
            }
        }

        if (body.ga_email && !(/@gmail\.com$/.test(body.ga_email))) {
            throw new Error(`Invalid GA mail address`);
        }

        return true;
    })
];

exports.deleteSchema = [
    query('id')
    .exists()
    .withMessage('user id is required!') 
]

exports.patientContactPostSchema = [
    body('type')
    .exists()
    .withMessage('type is required'),
    body().custom((body) => {
            
            if (Object.keys(body).length === 0) {
                throw new Error(`json request body can't be empty.`);
            }
    
            const allowedKeys = [
                "type",
                "name",
                "email",
                "mobile",
                "address",
                "alexa_id"
            ];
            for (const key of Object.keys(body)) {
                if (!allowedKeys.includes(key)) {
                    throw new Error(`Unknown property: ${key}`);
                }
            }
    
            return true;
        })
    ];
    

exports.patientContactGetAllSchema = [
    query().custom((query) => {

        const allowedKeys = [
            "contact_type",
            "contact_info",
            "value",
            "id"
        ];
        for (const key of Object.keys(query)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key}`);
            }
        }

        return true;
    })
];


exports.patientContactPutSchema = [
    body('type')
    .exists()
    .withMessage('type is required!'),
    body('id')
    .exists()
    .withMessage('id is required!'),
    body().custom((body) => {
            
            if (Object.keys(body).length === 0) {
                throw new Error(`json request body can't be empty.`);
            }
    
            const allowedKeys = [
                "id",
                "type",
                "name",
                "email",
                "mobile",
                "address",
                "alexa_id"
            ];
            for (const key of Object.keys(body)) {
                if (!allowedKeys.includes(key)) {
                    throw new Error(`Unknown property: ${key}`);
                }
            }
    
            return true;
        })
    ];
    
exports.updateNotficationsSchema = [
    body('sms')
    .exists()
    .withMessage('sms parameter is required in the body!'),
    body('email')
    .exists()
    .withMessage('e parameter is required in the body!'),
];

exports.postShareDataSchema = [
    body('contact_type')
    .exists()
    .withMessage('contact_type is required in the body!'),
    body('contact_id')
    .exists()
    .withMessage('contact_id is required in the body!'),
    body('share_method')
    .exists()
    .withMessage('share_method is required in the body!'),
    body('share_data_ids')
    .exists()
    .withMessage('share_data_ids is required in the body!'),
    body().custom((body) => {
            
        if (Object.keys(body).length === 0) {
            throw new Error(`json request body can't be empty.`);
        }

        const allowedKeys = [
            "contact_type",
            "contact_id",
            "share_method",
            "share_data_ids"
        ];
        for (const key of Object.keys(body)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Unknown property: ${key}`);
            }
        }

        return true;
    })
];