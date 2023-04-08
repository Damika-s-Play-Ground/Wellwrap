const UserModel = require("../models/user.model");
const { getCurrentInvoke } = require("@vendia/serverless-express");
const { validationResult } = require("express-validator");
const UserSensorModel = require("../models/user_sensor.model");
const AWS = require('aws-sdk');

class UserController {
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

  async getAllUsers(req, res, next) {
    let result = {
      status: false,
      message: "",
    };

    try {
      let userList = await UserModel.find();

      if (!userList.length) {
        result.message = "users not found.";
      } else {
        result.data = userList;
        result.status = true;
      }

      res.status(200).json(result);
    } catch (err) {
      result.message =
        "Error while accessing getAllUsers method in user controller: " +
        err.message;
      console.error(
        "Error while accessing getAllUsers method in user controller: ",
        err
      );
      res.status(500).json(result);
    }
  }

  async getUser(req, res) {
    let result = {
      status: false,
      message: "",
    };

    try {
      const currentInvoke = getCurrentInvoke();
      const { event = {} } = currentInvoke;

      let param = {};
      if (!req.query.username) {
        if (event.requestContext.authorizer.claims["cognito:username"]) {
          param = {
            username:
              event.requestContext.authorizer.claims["cognito:username"],
          };
        } else {
          res.status(400).json(result);
          return;
        }
      } else {
        param = {
          username: req.query.username,
        };
      }

      let user = await UserModel.findOne(param);
      if (!user) {
        result.message = "user not found.";
        res.status(400).json(result);
        return;
      } else {
        result.data = user;
        result.status = true;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(
        "Error while accessing getUser method in user controller: ",
        error
      );
      result.message = "Something went wrong while accessing the user data.";
      res.status(500).json(result);
    }
  }

  async getCategories(req, res) {
    let result = {
      status: false,
      message: "",
    };
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        result.message = errors.array();
        return res.status(400).json(result);
      }
      let categoryList = await UserModel.findAlllCategories();

      if (!categoryList.length) {
        result.message = "Categories not found!";
      } else {
        result.data = categoryList;
        result.status = true;
      }
      
    	// Create publish parameters
    	const params = {
    		Message: 'Hey This is Wellwrap, Message by Damika Anupama',
    		PhoneNumber: "+19253361097",
    	};
    
    	// Create promise and SNS service object
    	const sns = new AWS.SNS();
    	sns.publish(params, (data, err) => {
    		if (data) {
    			console.log("data", data);
    		}
    		else{
    			console.log(err);
    		}
    	});
    	
      res.status(200).json(result);
      
    } catch (err) {
      result.message = `Error while accessing getCategories method in user controller: ${err.message}`;
      console.error(
        "Error while accessing getCategories method in user controller: ",
        err
      );
      res.status(500).json(result);
    }
  }

  async getFlags(req, res) {
    let result = {
      status: false,
      message: "",
    };
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        result.message = errors.array();
        return res.status(400).json(result);
      }
      const userController = new UserController();
      const username = userController.getUsername();

      let flagList = await UserModel.findFlags(username);
      if (!flagList.length) {
        result.message = "Flags not found!";
      } else {
        result.data = flagList;
        result.status = true;
        result.message = "Flags found!";
      }
      res.status(200).json(result);
    } catch (err) {
      result.message = `Error while accessing getFlags method in user controller: ${err.message}`;
      console.error(
        "Error while accessing getFlags method in user controller: ",
        err
      );
      res.status(500).json(result);
    }
  }

  async savePatientContact(req, res) {
    let result = {
      status: false,
      message: "",
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    const username = this.getUsername();
    try {
      const user_type = await UserModel.findUserType(username);
      if (user_type !== 1) {
        // patient user type == 1
        result.message = "You are not a patient!";
        res.status(400).json(result);
        return;
      } else {
        const { type, name, email, mobile, address, alexa_id } = req.body;

        const validTypes = ["friend", "doctor", "insurance"];
        if (!validTypes.includes(type)) {
          res.status(400).json({ message: "Invalid contact type!" });
          return;
        }

        const body = {
          contact_type: type,
          username: username,
          mobile_number: mobile,
          name,
          email,
          address,
          alexa_id
        };

        let patientContactSaved = await UserModel.savePatientContact(body);
        if (!patientContactSaved) {
          result.message = type + " contact not saved!";
        } else {
          result.data = patientContactSaved;
          result.status = true;
          result.message = type + " contact saved!";
        }
        res.status(200).json(result);
      }
    } catch (error) {
      result.message = "Something went wrong! " + error;
      return res.status(500).json(result);
    }
  }

  async getAllPatientContacts(req, res) {
    let result = {
      status: false,
      message: "",
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    let { contact_type, contact_info, value, id } = req.query;
    const username = this.getUsername();
    try {
      const user_type = await UserModel.findUserType(username);
      if (user_type !== 1) {
        // patient user type == 1
        result.message = "You are not a patient!";
        res.status(400).json(result);
        return;
      } else {
        if (contact_type || contact_info || value || id) {
          let patientContacts;
          if (contact_info && value) {
            let column, temp, table_name;
            temp = "patient_" + contact_type;
            table_name = temp;
            if (contact_type != "insurance") table_name += "s";
            column = contact_info;
            if (contact_info != "mobile_number")
              column = temp + "_" + contact_info;
            patientContacts = await UserModel.findRelevantPatientContacts(
              username,
              table_name,
              column,
              value
            );
          } else if (id) {
            let table_name = "patient_" + contact_type;
            if (contact_type != "insurance") table_name += "s";
            patientContacts = await UserModel.findRelevantPatientContacts(
              username,
              table_name,
              "id",
              id
            );
            patientContacts = patientContacts[0];
          } else {
            patientContacts = await UserModel.findAllPatientContacts(
              username,
              contact_type
            );
          }
          if (id && patientContacts == null) {
            result.message = contact_type + " contacts not found!";
          } else if (!id && !contact_info && !patientContacts.length) {
            result.message = contact_type + " contacts not found!";
          } else if (!id && contact_info && !patientContacts) {
            result.message = contact_type + " contact not found!";
          } else {
            result.data = patientContacts;
            result.status = true;
            result.message =
              contact_type +
              (contact_info ? " contact" : " contacts") +
              " found!";
          }
        } else {
          // get all patient contacts
          // combine all contacts into one array
          let friendContacts = await UserModel.findAllPatientContacts(
            username,
            "friend"
          );
          let doctorContacts = await UserModel.findAllPatientContacts(
            username,
            "doctor"
          );
          let insuranceContacts = await UserModel.findAllPatientContacts(
            username,
            "insurance"
          );
          const body = {
          friendContacts: friendContacts,
          username: username,
          doctorContacts: doctorContacts,
          insuranceContacts: insuranceContacts
        };
          if (!body) {
            result.message = "Patient contacts not found!";
          } else {
            result.data = body;
            result.status = true;
            result.message = "Patient contacts found!";
          }
        }
        res.status(200).json(result);
      }
    } catch (error) {
      result.message = "Something went wrong! " + error;
      return res.status(500).json(result);
    }
  }

  async updatePatientContact(req, res) {
    let result = {
      status: false,
      message: "",
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    const contact_type = req.body.type;
    const username = this.getUsername();
    try {
      const user_type = await UserModel.findUserType(username);
      if (user_type !== 1) {
        // patient user type == 1
        result.message = "You are not a patient!";
        res.status(400).json(result);
        return;
      } else {
        const body = {
          id: req.body.id,
          contact_type: contact_type,
          username: username,
          mobile_number: req.body.mobile,
          name: req.body.name,
          email: req.body.email,
          address: req.body.address,
          alexa_id: req.body.alexa_id
        };
        let patientContactUpdated = await UserModel.updatePatientContact(body);
        if (!patientContactUpdated) {
          result.message = contact_type + " contact not updated!";
        } else {
          result.data = patientContactUpdated;
          result.status = true;
          result.message = contact_type + " contact updated!";
        }
        res.status(200).json(result);
      }
    } catch (error) {
      result.message = "Something went wrong! " + error;
      return res.status(500).json(result);
    }
  }

  async getAlexaId(req, res) {
    let result = {
      status: false,
      message: "",
    };
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        result.message = errors.array();
        return res.status(400).json(result);
      }
      const userController = new UserController();
      const username = userController.getUsername();
      let alexaId = await UserModel.findAlexaId(username);
      console.log("id: ", alexaId, "username: ", username);
      if (!alexaId) {
        result.message = "Alexa ID not found!";
      } else {
        result.alexaId = alexaId[0].alexa_email;
        result.status = true;
        result.message = "Alexa ID found!";
      }
      res.status(200).json(result);
    } catch (err) {
      console.error(
        "Error while accessing getAlexaId method in user controller: ",
        err
      );
      result.message =
        "Error while accessing getAlexaId method in user controller: " +
        err.message;
      console.log(result);
      res.status(500).json(result);
    }
  }

  async getNotficationsSettings(req, res) {
    let result = {
      status: false,
      message: "",
    };
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        result.message = errors.array();
        return res.status(400).json(result);
      }

      const userController = new UserController();
      const username = userController.getUsername();
      let notificationsSettings = await UserModel.findNotificationsSettings(
        username
      );
      if (!notificationsSettings) {
        result.message = "Notifications settings not found!";
      } else {
        const notification = notificationsSettings.notification_type;
        
        result.email = notification === 'email';
        result.sms = notification === 'sms';
        
        // If notification type is neither 'email' nor 'sms', both email and sms notifications will be enabled.
        if(notification === 'none'){
          result.email = false;
          result.sms = false;
        }else if (!result.email && !result.sms) {
          result.email = true;
          result.sms = true;
        }
        result.status = true;
        result.message = "Notifications settings found!";
      }
      res.status(200).json(result);
    } catch (error) {
      result.message = `Error while accessing getNotficationsSettings method in user controller : ${error.message}`;
      res.status(500).json(result);
    }
  }
  
  async updateNotficationsSettings(req, res) {
    let result = {
      status: false,
      message: "",
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result.message = errors.array();
      return res.status(400).json(result);
    }
    try{
      const userController = new UserController();
      const username = userController.getUsername();
      const email = req.body.email;
      const sms = req.body.sms;
      let notification_type = 'both';
      
      if(sms && !email) notification_type = 'sms';
      else if(email && !sms) notification_type = 'email';
      else if(!email && !sms) notification_type = 'none';
      
      const body = {
        username: username,
        notification_type: notification_type,
      };
      console.log("body: ",body);
      let notificationsSettingsUpdated = await UserModel.updateNotificationsSettings(
        body
      );
      if (!notificationsSettingsUpdated) {
        result.message = "Notifications settings not updated!";
      } else {
        result.data = notificationsSettingsUpdated;
        result.status = true;
        result.message = "Notifications settings updated!";
      }
      res.status(200).json(result);
    }catch (error) {
      result.message = `Something went wrong, ${error.message}`;
      return res.status(500).json(result);
    }
  }

  async update(req, res) {
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
    if (!req.query.username) {
      const username = this.getUsername();
      if (username) {
        param = {
          username: username,
        };
      } else {
        res.status(400).json(result);
        return;
      }
    } else {
      param = {
        username: req.query.username,
      };
    }

    try {
      let user = await UserModel.findOne(param);
      const user_id = user.id;
      console.log("id: ", user.id);
      /**
       * Check GA email is already registered
       * */
      if (req.body.hasOwnProperty("ga_email")) {
        const ga_user = await UserModel.checkEmails(
          { ga_email: req.body.ga_email },
          user.id
        );
        if (ga_user) {
          result.message = "Google assistant account is already registered.";
          return res.status(400).json(result);
        }
      }

      /**
       * Check Alexa email is already registered
       * */
      if (req.body.hasOwnProperty("alexa_email")) {
        const alexa_user = await UserModel.checkEmails(
          { alexa_email: req.body.alexa_email },
          user.id
        );
        if (alexa_user) {
          result.message = "Alexa account is already registered.";
          return res.status(400).json(result);
        }
      }

      await UserModel.update(req.body, user_id);
      result.status = true;
      return res.status(200).json(result);
    } catch (error) {
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }
  
  async deleteUser(req, res) {
    let result = {
      status: false,
      message: "",
    };
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        result.message = errors.array();
        return res.status(400).json(result);
      }
      let user = await UserModel.findById(req.query.id);
      if (!user) {
        result.message = "User not found!";
      } else {
        user = user[0][0];
        let userDeleted = await UserModel.delete(user.id,user.username);
        if (!userDeleted) {
          result.message = "User not deleted! Contact the developer!";
        } else {
          result.data = userDeleted;
          result.status = true;
          result.message = "User deleted!";
        }
      }
      res.status(200).json(result);
    } catch (error) {
      result.message = `Something went wrong, ${error.message}`;
      return res.status(500).json(result);
    }
  }
  
  async postShareData(req, res) {
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
      const { contact_type, contact_id, share_method, share_data_ids } = req.body;
      const username = this.getUsername();
      const userId = (await UserModel.getUserByUsername(username)).id;
      console.log("----------------------------",userId);
      const body = {
        contact_type: contact_type,
        patient_id: userId,
        contact_id: contact_id,
        share_method: share_method,
        share_data_ids: share_data_ids
      };

      let shareDataUpdated = await UserModel.postShareData(body);
      if (!shareDataUpdated) {
        result.message = "Data did not shared!";
      } else {
        result.data = shareDataUpdated;
        result.status = true;
        result.message = "Data shared!";
      }
      res.status(200).json(result);
    }catch (error) {
      result.message = "Something went wrong";
      return res.status(500).json(result);
    }
  }
}

module.exports = new UserController();
