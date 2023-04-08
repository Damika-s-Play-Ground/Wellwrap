const express = require("express");
const userController = require("../controllers/user.controller");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

const {
  updateSchema,
  deleteSchema,
  patientContactPostSchema,
  patientContactGetAllSchema,
  patientContactPutSchema,
  updateNotficationsSchema,
  postShareDataSchema
} = require("../middleware/validators/userValidator.middleware");
const sensorController = require("../controllers/sensor.controller");

const router = express.Router({
  mergeParams: true,
});

router.get("/", awaitHandlerFactory(userController.getUser));
router.get("/list", awaitHandlerFactory(userController.getAllUsers));
router.post(
  "/",
  updateSchema,
  awaitHandlerFactory(userController.update.bind(sensorController))
);
router.delete(
  "/",
  deleteSchema,
  awaitHandlerFactory(userController.deleteUser.bind(userController))
);
router.post(
  "/patient-contacts",
  patientContactPostSchema,
  awaitHandlerFactory(userController.savePatientContact.bind(userController))
);
router.get(
  "/patient-contacts",
  patientContactGetAllSchema,
  awaitHandlerFactory(userController.getAllPatientContacts.bind(userController))
);
router.put(
  "/patient-contacts",
  patientContactPutSchema,
  awaitHandlerFactory(userController.updatePatientContact.bind(userController))
);
router.get("/category", awaitHandlerFactory(userController.getCategories));
router.get("/flag", awaitHandlerFactory(userController.getFlags));
router.get("/alexa-id", awaitHandlerFactory(userController.getAlexaId));
router.get(
  "/notification-settings",
  awaitHandlerFactory(userController.getNotficationsSettings)
);
router.put(
  "/notification-settings",
  updateNotficationsSchema,
  awaitHandlerFactory(userController.updateNotficationsSettings)
);
router.post(
  "/share-data",
  postShareDataSchema,
  awaitHandlerFactory(userController.postShareData.bind(userController))
);

module.exports = router;
