const UserModel = require('../models/user.model');
const UserPainModel = require("../models/user_pain.model");
const {getCurrentInvoke} = require("@vendia/serverless-express");
const { validationResult } = require('express-validator');

class PainController {

    getUsername() {
        const currentInvoke = getCurrentInvoke();
        const { event = {} } = currentInvoke;
        if (event.requestContext.authorizer.claims['cognito:username']) {
            return event.requestContext.authorizer.claims['cognito:username']
        } else {
            return 0;
        }
    }

    async getUserPains(req, res, next) {
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

        let userPainList = await UserPainModel.find(param);

        if (!userPainList.length) {
            result.message = 'pain data not found.';
        } else {
            result.data = userPainList;
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

        const {pain_number, timestamp} = req.body;

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

        let data = await UserPainModel.create({user_id, pain_number, timestamp});

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

        let data = await UserPainModel.update(req.body, req.params.id);

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

        let data = await UserPainModel.delete(req.params.id);

        if (!data) {
            result.message = 'Something went wrong';
            return res.status(500).json(result);
        }

        result.status = true;
        res.status(200).json(result);
    }
}

module.exports = new PainController;