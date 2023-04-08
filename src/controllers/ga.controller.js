const UserModel = require("../models/user.model");
const GAModel = require("../models/ga.model");
const GAQuestionModel = require("../models/ga_question.model");
const GAQuestionTypeModel = require("../models/ga_question_type.model");
const { validationResult } = require("express-validator");
const { getCurrentInvoke } = require("@vendia/serverless-express");

class GAController {
  getUsername() {
    try {
      const currentInvoke = getCurrentInvoke();
      const { event = {} } = currentInvoke;
      if (event.requestContext.authorizer.claims["cognito:username"]) {
        return event.requestContext.authorizer.claims["cognito:username"];
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error while getting username in user controller: ", error);
      throw error;
    }
  }

  async getData(req, res, next) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    try {
      let param = {
        ga: {},
      };
      if (!req.query.username) {
        const username = this.getUsername();
        if (username) {
          param.user = {};
          param.user.username = username;
        } else {
          res.status(400).json(result);
          return;
        }
      } else {
        param.user = {};
        param.user.username = req.query.username;
      }

      if (req.query.type) {
        param.ga_question = {};
        param.ga_question.type = req.query.type;
      }

      if (req.query.tag) {
        param.ga.tag = req.query.tag;
      }
/////
      if (req.query.timestamp && /^\d+$/.test(req.query.timestamp)) {
        const timestamp = Number(req.query.timestamp);
        const created_time = (timestamp + 28800) * 1000;
      
        if (!isNaN(created_time)) {
          param.ga.created = new Date(created_time)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");
        } else {
          console.error(`Invalid timestamp value: ${req.query.timestamp}`);
          console.log(`Relevant request query details: `, req.query);
        }
      } else {
        console.error(`Missing or invalid timestamp parameter: ${req.query.timestamp}`);
        console.log(`Relevant request query details: `, req.query);
      }
////
      console.log("param: ",param);
      let qaList = await GAModel.find(param);

      console.log(qaList);
      if (!qaList.length) {
        result.message = "questions and answers data not found.";
      } else {
        result.data = qaList;
        result.status = true;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(
        "Error while accessing getData method in ga controller: ",
        error
      );
      result.message = `Something went wrong while accessing the getData ${error.message}`;
      res.status(500).json(result);
    }
  }

  async getFAQData(req, res, next) {
    let result = {
      status: false,
      message: "",
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    try {
      const username = this.getUsername();
      const tag = req.query.tag;
      let faqs = await GAModel.findFAQs(username, tag);
      result.status = true;
      result.data = faqs;
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }
  async getFAQDataAnswers(req, res, next) {
    let result = {
      status: false,
      message: "",
    };
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    try {
      const username = this.getUsername();
      let { tag, timestamp } = req.query;
      let faqs = await GAModel.findFAQsAnswers(username, tag, timestamp);
      result.status = true;
      result.data = faqs;
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);  
    }
  }


  async createFAQ(req, res, next) {
    let result = {
      status: false,
      message: "",
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    try {
      const { answers } = req.body;
      const ga_email = "ga_email" in req.body ? req.body.ga_email : "";
      const alexa_email = "alexa_email" in req.body ? req.body.alexa_email : "";
      let tag = "google_assistant";
      if (alexa_email) {
        tag = "alexa";
      }
      let param = {
        ga_email: ga_email,
        alexa_email: alexa_email,
      };

      let user = await UserModel.findOne(param, "or");

      console.log(tag);
      if (!user) {
        result.message = "user not found or does not have the mail.";
        return res.status(400).json(result);
      } else {
        let user_id = user.id;
        let data = await GAModel.createFAQ(user_id, tag, answers);
        if (!data) {
          result.message = "Something went wrong";
          return res.status(500).json(result);
        }
      }

      result.status = true;
      result.message = "FAQ saved successfully!";
      res.status(201).json(result);
    } catch (error) {
      console.error(
        "Error while accessing createFAQ method in user controller: ",
        error
      );
      result.message = `Something went wrong while accessing the createFAQ: ${error.message}`;
      res.status(500).json(result);
    }
  }

  async create(req, res, next) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    try {
      const { answers } = req.body;
      const ga_email = "ga_email" in req.body ? req.body.ga_email : "";
      const alexa_email = "alexa_email" in req.body ? req.body.alexa_email : "";

      let tag = "google_assistant";
      if (alexa_email) {
        tag = "alexa";
      }

      let param = {
        ga_email: ga_email,
        alexa_email: alexa_email,
      };

      let user = await UserModel.findOne(param, "or");

      console.log(tag);
      if (!user) {
        result.message = "user not found or does not have the mail.";
        return res.status(400).json(result);
      } else {
        let user_id = user.id;
        answers.map((answer) => {
          answer.user_id = user_id;
          answer.tag = tag;
        });

        for (let item of answers) {
          const qn = await GAQuestionModel.findOne({ id: item.qn_id });
          if (!qn) {
            result.message = "Invalid question type id: " + item.qn_id;
            return res.status(400).json(result);
          }
        }
        console.log("saving answers: ", answers);
        let data = await GAModel.multiCreate(answers);
        if (!data) {
          result.message = "Something went wrong";
          return res.status(500).json(result);
        }
      }

      result.status = true;
      res.status(201).json(result);
    } catch (error) {
      console.error(
        "Error while accessing create method in user controller: ",
        error
      );
      result.message = `Something went wrong while accessing the create : ${error.message}`;
      res.status(500).json(result);
    }
  }

  async getUsers(req, res, next) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    try {
      let params = {
        ga_email: req.body.ga_email,
        alexa_email: req.body.ga_email,
      };
      let userList = await UserModel.find(params, "or");

      if (!userList.length) {
        result.message = "users not found.";
      } else {
        result.data = userList;
        result.status = true;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(
        "Error while accessing getUsers method in user controller: ",
        error
      );
      result.message = `Something went wrong while accessing the getUsers: ${error.message}`;
      res.status(500).json(result);
    }
  }

  async getQnTypePopup(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    try {
      let { qn_type_name } = req.query;
      let qn_type = "";
      if (qn_type_name == "my_ai_nurse") {
        qn_type = "My AI Nurse";
      } else if (qn_type_name == "my_diabetes_nurse") {
        qn_type = "My Diabetes Nurse";
      } else if (qn_type_name == "pre_procedure") {
        qn_type = "Pre Procedure";
      } else if (qn_type_name == "post_procedure") {
        qn_type = "Post Procedure";
      } else if (qn_type_name == "emergency") {
        qn_type = "Emergency";
      } else if (qn_type_name == "get_answers") {
        qn_type = "Get Answers";
      }
      let ga_qn_types = await GAQuestionTypeModel.findpopup(qn_type);

      if (!ga_qn_types.length) {
        result.message = "Question types not found.";
      } else {
        result.data = ga_qn_types;
        result.status = true;
      }
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  async getQnType(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }

    let param = {};
    if (Object.keys(req.query).length) {
      param = req.query;
    }

    try {
      let ga_qn_types = await GAQuestionTypeModel.find(param);

      if (!ga_qn_types.length) {
        result.message = "Question types not found.";
      } else {
        result.data = ga_qn_types;
        result.status = true;
      }
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  async getAnswersForTagQnType(gaQnType, tag) {
    try {
      const answers = await GAModel.findGroupBy(
        this.getUsername(),
        gaQnType.id,
        tag
      );
      return answers;
    } catch (error) {
      console.error(
        "Error while accessing getAnswersForTagQnType in ga controller: ",
        error
      );
      throw error;
    }
  }

  async getAnswers(gaQnType, tag, from, to) {
    try {
      const answers = await this.getAnswersForTagQnType(gaQnType, tag);
      console.log(answers);
      const data = [];
      for (const answer of answers) {
        if (gaQnType.link === null) {
          continue;
        }

        const link =
          tag === "google_assistant" ? gaQnType.link : gaQnType.alexa_link;
        const createdDate = new Date(answer.created);

        if (
          to != null &&
          from != null &&
          !(createdDate >= new Date(from) && createdDate <= new Date(to))
        ) {
          continue;
        }

        data.push({
          id: gaQnType.id,
          name: gaQnType.name,
          link,
          timestamp: this.changeTimeZone(answer.created, "America/Los_Angeles"),
        });
      }
      return data;
    } catch (error) {
      console.error(
        "Error while accessing getAnswers method in ga controller: ",
        error
      );
      throw error;
    }
  }

  async getGAQuestionTypes(param) {
    try {
      const ga_qn_types = await GAQuestionTypeModel.find(param);
      if (!ga_qn_types.length) {
        throw new Error("Question types not found.");
      }
      return ga_qn_types;
    } catch (error) {
      console.error(
        "Error while accessing getGAQuestionTypes method in ga controller: ",
        error
      );
      throw error;
    }
  }

  async getAnswerQnType(req, res) {
    const result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }

    let { tag, from, to, ...param } = req.query;

    if (from && to) {
      from = new Date(from);
      to = new Date(to);
    }

    delete param.tag;

    try {
      const ga_qn_types = await this.getGAQuestionTypes(param);
      const data = await Promise.all(
        ga_qn_types.map((gaQnType) => this.getAnswers(gaQnType, tag, from, to))
      ).then((results) => results.flat().sort(this.sortArrayByTimestamp));

      result.status = true;
      result.data = data;
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  async getHistory(req, res) {
    const result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    let { tag, from, to, ...param } = req.query;
    if (from && to) {
        from = new Date(from);
        to = new Date(to);
      }else{
        to = new Date();
        from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
  
    try {
      const ga_qn_types = await this.getGAQuestionTypes(param);
      let data = [];
      for (const gaQnType of ga_qn_types) {
        const answers = await this.getAnswersForTagQnType(gaQnType, tag);
        if (answers.length === 0) {
          continue;
        }
        for (const answer of answers) {
          const createdDate = new Date(answer.created);
          console.log("created: ", createdDate, " to: ", to, " from: ", from);
          if (createdDate >= from && createdDate <= to) data.push(answer);
        }
        data = data.sort(this.sortArrayByTimestamp);
      }

      result.status = true;
      result.data = data;
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  async createQnType(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }

    const { name, link } = req.body;

    try {
      const qn_type = await GAQuestionTypeModel.create({
        name: name,
        link: link,
        alexa_link: "alexa_link" in req.body ? req.body.alexa_link : "",
        alexa_skill_id:
          "alexa_skill_id" in req.body ? req.body.alexa_skill_id : "",
      });
      if (qn_type) {
        result.status = true;
        return res.status(201).json(result);
      } else {
        result.message = "Something went wrong";
        return res.status(400).json(result);
      }
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  async editQnType(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }

    const { id, name, link } = req.body;

    try {
      const datetime = new Date().toISOString().slice(0, 19).replace("T", " ");
      const param = {
        name: name,
        link: link,
        alexa_link: "alexa_link" in req.body ? req.body.alexa_link : "",
        alexa_skill_id:
          "alexa_skill_id" in req.body ? req.body.alexa_skill_id : "",
        modified: datetime,
      };
      const qn_type = await GAQuestionTypeModel.update(param, id);
      if (qn_type) {
        result.status = true;
        return res.status(200).json(result);
      } else {
        result.message = "Invalid question type id";
        return res.status(400).json(result);
      }
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  async deleteQnType(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    try {
      let data = await GAQuestionTypeModel.delete(req.params.id);

      if (!data) {
        result.message = "Something went wrong";
        return res.status(500).json(result);
      }

      result.status = true;
      res.status(200).json(result);
    } catch (error) {
      console.error(
        "Error while accessing deleteQnType method in ga controller: ",
        error
      );
      result.message = `Something went wrong while accessing the ga data: ${error}`;
      res.status(500).json(result);
    }
  }

  async createQuestion(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }

    const { question, type } = req.body;

    try {
      const qn_type = await GAQuestionTypeModel.findOne({ id: type });
      if (qn_type) {
        const qn = await GAQuestionModel.create({
          question: question,
          type: type,
        });
        if (qn) {
          result.status = true;
          return res.status(201).json(result);
        } else {
          result.message = "Something went wrong";
          return res.status(400).json(result);
        }
      } else {
        result.message = "Invalid question type id";
        return res.status(400).json(result);
      }
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  async createQuestions(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }

    const questions = req.body;
    const datetime = new Date().toISOString().slice(0, 19).replace("T", " ");

    try {
      let update_items = [];
      for (let item of questions) {
        if ("id" in item) {
          update_items.push(item.id);
        }
      }

      let check_types = [];
      for (let item of questions) {
        const { type } = item;

        if (check_types.includes(type)) {
          continue;
        }

        let qn_list = await GAQuestionModel.find({ type: type });
        for (let qn of qn_list) {
          if (!update_items.includes(qn.id)) {
            await GAQuestionModel.delete(qn.id);
          }
        }
        check_types.push(type);
      }

      for (let item of questions) {
        const { question, type } = item;
        const qn_type = await GAQuestionTypeModel.findOne({ id: type });
        if (qn_type) {
          if ("id" in item) {
            let id = item.id;
            let param = {
              question: question,
              type: type,
              modified: datetime,
            };
            await GAQuestionModel.update(param, id);
          } else {
            item.id = await GAQuestionModel.create({
              question: question,
              type: type,
            });
          }
        }
      }
      result.status = true;
      result.data = questions;
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  async getQuestion(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }

    let param = {};
    if (Object.keys(req.query).length) {
      param = req.query;
    }

    try {
      let ga_qn = await GAQuestionModel.find(param);

      if (!ga_qn.length) {
        result.message = "Question not found.";
      } else {
        result.data = ga_qn;
        result.status = true;
      }
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  async editQuestion(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }

    const { id, question, type } = req.body;
    try {
      const qn_type = await GAQuestionTypeModel.findOne({ id: type });

      if (qn_type) {
        const datetime = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        const param = {
          question: question,
          type: type,
          modified: datetime,
        };
        const qn = await GAQuestionModel.update(param, id);
        if (qn) {
          result.status = true;
          return res.status(200).json(result);
        } else {
          result.message = "Invalid question id";
          return res.status(400).json(result);
        }
      } else {
        result.message = "Invalid question type id";
        return res.status(400).json(result);
      }
    } catch (error) {
      console.log(error);
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }

  sortArray(arr, key) {
    try {
      arr.sort((a, b) => {
        return b[key] - a[key];
      });
      return arr;
    } catch (error) {
      console.error(
        "Error while accessing sortArray method in user controller: ",
        error
      );
      throw error;
    }
  }

  changeTimeZone(date, timeZone) {
    try {
      if (typeof date === "string") {
        return (
          new Date(
            new Date(date).toLocaleString("en-US", {
              timeZone,
            })
          ).getTime() / 1000
        );
      }

      return (
        new Date(
          date.toLocaleString("en-US", {
            timeZone,
          })
        ).getTime() / 1000
      );
    } catch (error) {
      console.error(
        "Error while accessing changeTimeZone method in user controller: ",
        error
      );
      throw error;
    }
  }
}

module.exports = new GAController();
