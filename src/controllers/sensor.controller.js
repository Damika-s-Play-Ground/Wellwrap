const UserModel = require('../models/user.model');
const UserSensorModel = require("../models/user_sensor.model");
const {getCurrentInvoke} = require("@vendia/serverless-express");
const { validationResult } = require('express-validator');
const UserPainModel = require("../models/user_pain.model");

class SensorController {

    getUsername() {
        const currentInvoke = getCurrentInvoke();
        const { event = {} } = currentInvoke;
        if (event.requestContext.authorizer.claims['cognito:username']) {
            return event.requestContext.authorizer.claims['cognito:username']
        } else {
            return 0;
        }
    }

    async getUserSensors(req, res, next) {
        let result = {
            status: false,
            message: ''
        };

        let param = {};
        if (!req.query.username) {
            const username = this.getUsername();
            if (username) {
                param = {
                    username: username
                }
            } else {
                res.status(400).json(result);
                return;
            }
        } else {
            param = {
                username: req.query.username
            }
        }

        let userSensorList = await UserSensorModel.find(param);

        if (!userSensorList.length) {
            result.message = 'sensor data not found.';
        } else {
            result.data = userSensorList;
            result.status = true;
        }

        res.status(200).json(result);
    }

    async create(req, res, next) {
        let result = {
            status: false,
            message: ''
        };

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            result.message = errors.array();
            return res.status(400).json(result);
        }

        const {bp, temp, timestamp} = req.body;

        let param = {};
        if (!req.query.username) {
            const username = this.getUsername();
            if (username) {
                param = {
                    username: username
                }
            } else {
                res.status(400).json(result);
                return;
            }
        } else {
            param = {
                username: req.query.username
            }
        }

        let user = await UserModel.findOne(param);
        const user_id = user.id;

        let data = await UserSensorModel.create({user_id, bp, temp, timestamp});

        if (!data) {
            result.message = 'Something went wrong';
            return res.status(500).json(result);
        }

        result.status = true;
        res.status(201).json(result);
    }

    async update(req, res, next) {
        let result = {
            status: false,
            message: ''
        };

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            result.message = errors.array();
            return res.status(400).json(result);
        }

        let data = await UserSensorModel.update(req.body, req.params.id);

        if (!data) {
            result.message = 'Something went wrong';
            return res.status(500).json(result);
        }

        result.status = true;
        res.status(200).json(result);
    }

    async delete(req, res) {
        let result = {
            status: false,
            message: ''
        };

        let data = await UserSensorModel.delete(req.params.id);

        if (!data) {
            result.message = 'Something went wrong';
            return res.status(500).json(result);
        }

        result.status = true;
        res.status(200).json(result);
    }
}

module.exports = new SensorController;