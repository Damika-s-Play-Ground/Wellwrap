const express = require('express');
const gaController = require('../controllers/ga.controller');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const {
  questionSchema,
  createSchema,
  getUsersSchema,
  createQnSchema,
  getQnSchema,
  editQnSchema,
  createQnsSchema,
  createQnTypeSchema,
  getQnTypeSchema,
  getAnswerQnTypeSchema,
  editQnTypeSchema,
  deleteQnTypeSchema,
  faqPostSchema,
  popupCheckSchema,
  getHistorySchema,
} = require("../middleware/validators/gaValidator.middleware");

const router = express.Router({
    mergeParams:true
});


router.get(
  "/",
  questionSchema,
  awaitHandlerFactory(gaController.getData.bind(gaController))
);
router.get(
  "/faq",
  questionSchema,
  awaitHandlerFactory(gaController.getFAQData.bind(gaController))
);
router.post(
  "/faq",
  faqPostSchema,
  awaitHandlerFactory(gaController.createFAQ.bind(gaController))
);
router.post(
  "/",
  createSchema,
  awaitHandlerFactory(gaController.create.bind(gaController))
);
router.post(
  "/users",
  getUsersSchema,
  awaitHandlerFactory(gaController.getUsers.bind(gaController))
);
router.get(
  "/question",
  getQnSchema,
  awaitHandlerFactory(gaController.getQuestion.bind(gaController))
);
router.get(
  "/questions",
  getQnSchema,
  awaitHandlerFactory(gaController.getQuestion.bind(gaController))
);
router.post(
  "/question",
  createQnSchema,
  awaitHandlerFactory(gaController.createQuestion.bind(gaController))
);
router.post(
  "/questions",
  createQnsSchema,
  awaitHandlerFactory(gaController.createQuestions.bind(gaController))
);
router.put(
  "/question",
  editQnSchema,
  awaitHandlerFactory(gaController.editQuestion.bind(gaController))
);
router.get(
  "/qn_type",
  getQnTypeSchema,
  awaitHandlerFactory(gaController.getQnType.bind(gaController))
);
router.get(
  "/qn_type/popup",
  popupCheckSchema,
  awaitHandlerFactory(gaController.getQnTypePopup.bind(gaController))
);
router.get(
  "/answer/qn_type",
  getAnswerQnTypeSchema,
  awaitHandlerFactory(gaController.getAnswerQnType.bind(gaController))
);
router.get(
  "/history",
  getHistorySchema,
  awaitHandlerFactory(gaController.getHistory.bind(gaController))
);
router.post(
  "/qn_type",
  createQnTypeSchema,
  awaitHandlerFactory(gaController.createQnType.bind(gaController))
);
router.put(
  "/qn_type",
  editQnTypeSchema,
  awaitHandlerFactory(gaController.editQnType.bind(gaController))
);
router.delete(
  "/qn_type/:id",
  deleteQnTypeSchema,
  awaitHandlerFactory(gaController.deleteQnType.bind(gaController))
);

module.exports = router;