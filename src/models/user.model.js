const pool = require('./db').promise();
const { multipleColumnSet } = require('../utils/common.utils');

class UserModel {
    tableName = 'user';
    categoryTableName = 'user_type_def';
    flagTableName = 'user_services';

    findNotificationsSettings = async (username) => {
        const sql = `SELECT n.notification_type 
                     FROM user AS u 
                     INNER JOIN user_notification AS n 
                     ON u.id = n.user_id 
                     WHERE u.username = ?`;
        const [rows, fields] = await pool
            .query(sql, [username])
            .catch((err) => {
                throw err;
            });
        return rows[0]; // assuming that username is unique and will only return one row
    };
    
    updateNotificationsSettings = async (body) => {
      let result = {};
      try{
        const user = await this.getUserByUsername(body.username);
        const userId = user.id;
        const sql = `UPDATE user_notification SET notification_type=?, latest_update=? WHERE user_id=?`;
        const params = [
          body.notification_type,
          new Date(),
          userId
        ];
        const [rows] = await pool.query(sql, params);
    
        // Format the results
        result = rows;
        result.message = 'Success';
      }catch(err){
        console.log(err);
        result.message = 'Error retrieving in updateNotificationsSettings method userModel!';
      }
      return result;
    }
    
    getUserByUsername = async (username) => {
        const sql = `SELECT id FROM ${this.tableName} WHERE username = ?`;
        const [rows, fields] = await pool.query(sql, [username]).catch(err => {throw err});
        return rows[0]; // assuming that username is unique and will only return one row
    }
    
        findRelevantPatientContacts = async (username, table_name,column,value) => {
      let result = {};
      try{
        const user = await this.getUserByUsername(username);
        const patientId = user.id;
        const sql = `SELECT * FROM ${table_name} WHERE patient_id = ? and ${column} = ?`;
        const [rows, fields] = await pool.query(sql, [patientId,value]);
    
        // Format the results
        result = rows;
        result.message = 'Success';
      }catch(err){
        console.log(err);
        result.message = 'Error retrieving in findRelevantPatientContacts method userModel!';
      }
      return result;
    }
    
    findAllPatientContacts = async (username, contact_type) => {
        let result = {};
      
        try {
          // Get user ID from username
          const user = await this.getUserByUsername(username);
          const patientId = user.id;
      
          // Query the appropriate table based on the contact_type
          let tableName;
          switch (contact_type) {
            case 'friend':
              tableName = 'patient_friends';
              break;
            case 'doctor':
              tableName = 'patient_doctors';
              break;
            case 'insurance':
              tableName = 'patient_insurance';
              break;
            default:
              result.message = 'Invalid contact type!';
              return result;
          }
      
          // Query the patient contact table
          const sql = `SELECT * FROM ${tableName} WHERE patient_id = ?`;
          const [rows, fields] = await pool.query(sql, [patientId]);
      
          // Format the results
          result = rows;
          result.message = 'Success';
        } catch (err) {
          console.log(err);
          result.message = 'Error retrieving ' + contact_type + ' contacts';
        }
      
        return result;
    }

    savePatientContact = async (body) => {
        const { contact_type, username, mobile_number, address, alexa_id } = body;
        let tableName;
        let nameColumn;
        let emailColumn;
        
        switch (contact_type) {
            case 'friend':
                tableName = 'patient_friends';
                nameColumn = 'patient_friend_name';
                emailColumn = 'patient_friend_email';
            break;
            case 'doctor':
                tableName = 'patient_doctors';
                nameColumn = 'patient_doctor_name';
                emailColumn = 'patient_doctor_email';
            break;
            case 'insurance':
                tableName = 'patient_insurance';
                nameColumn = 'patient_insurance_name';
                emailColumn = 'patient_insurance_email';
            break;
            default:
            throw new Error('Invalid contact type');
        }
        
        const user = await this.getUserByUsername(username);
        
        const data = {
            patient_id: user.id,
            [nameColumn]: body.name,
            [emailColumn]: body.email,
            mobile_number: mobile_number,
            address: address,
            alexa_id: alexa_id
        };
        
        const sql = `INSERT INTO ${tableName} SET ?`;
        const [result] = await pool.query(sql, data);
        
        return result.insertId;
    };
    
    updatePatientContact = async (body) => {
        let result = {};
    
        try {
    
          // Get the patient ID for the given username
          const user = await this.getUserByUsername(body.username);
          if (!user) {
            result.message = "User not found";
            return result;
          }
    
          let sql, params;
    
          switch (body.contact_type) {
            case "friend":
              sql = `UPDATE patient_friends SET patient_friend_name=?, patient_friend_email=?, mobile_number=?, modified=?, address=?, alexa_id=? WHERE id=? AND patient_id=?`;
              params = [
                body.name,
                body.email,
                body.mobile_number,
                new Date(),
                body.address,
                body.alexa_id,
                body.id,
                user.id,
              ];
              break;
            case "doctor":
              sql = `UPDATE patient_doctors SET patient_doctor_name=?, patient_doctor_email=?, mobile_number=?, modified=?, address=?, alexa_id=? WHERE id=? AND patient_id=?`;
              params = [
                body.name,
                body.email,
                body.mobile_number,
                new Date(),
                body.address,
                body.alexa_id,
                body.id,
                user.id,
              ];
              break;
            case "insurance":
              sql = `UPDATE patient_insurance SET patient_insurance_name=?, patient_insurance_email=?, mobile_number=?, modified=?, address=?, alexa_id=? WHERE id=? AND patient_id=?`;
              params = [
                body.name,
                body.email,
                body.mobile_number,
                new Date(),
                body.address,
                body.alexa_id,
                body.id,
                user.id,
              ];
              break;
            default:
              result.message = "Invalid contact type";
              return result;
          }
    
          // Execute the update query
          const [resultRows] = await pool.query(sql, params);
    
          if (resultRows.affectedRows === 0) {
            result.message = "Contact not found";
            return result;
          }
    
    
          result.success = true;
          return result;
        } catch (err) {
          throw err;
        }
    };
      
    findUserType = async (username) => {
        const sql = `SELECT user_type FROM ${this.tableName} WHERE username = ?`;
        const [rows, fields] = await pool.query(sql, [username]).catch(err => { throw err });
        return rows[0].user_type;
    }

    findAlexaId = async (username) => {
        const sql = `SELECT alexa_email FROM ${this.tableName} WHERE username = ?`;
        const [rows, fields] = await pool.query(sql, [username]).catch(err => { throw err });
        return rows;
    }
    findFlags = async (username) => {
        const sql = `SELECT s.*, u.user_type, u.language, u.alexa_email
                     FROM ${this.flagTableName} as s
                     JOIN ${this.tableName} as u ON s.user_id = u.id
                     WHERE u.username = ?`;
        const [rows, fields] = await pool.query(sql, [username]).catch(err => { throw err });
      
        const result = rows.map(row => {
          // Extract the flag values from the row and return as an object
          return {
            device_access: row.device_access,
            nurse_chat_access: row.nurse_chat_access,
            help_access: row.help_access,
            faq_access: row.faq_access,
            medication_access: row.medication_access,
            pain_access: row.pain_access,
            visual_access: row.visual_access,
            profile_access: row.profile_access,
            share_data_access: row.share_data_access,
            alexa_access: row.alexa_access,
            google_assistant_access: row.google_assistant_access,
            siri_access: row.siri_access
          };
        });
      
        // Extract the user_type from the first row and add to the result array
        if (rows.length > 0) {
          result[0].user_type = rows[0].user_type;
          result[0].language = rows[0].language;
          result[0].alexa_email = rows[0].alexa_email;
        }
      
        return result;
    }
    
    findAlllCategories = async () => {
        let result;
        const sql = `SELECT * FROM ${this.categoryTableName}`; 
        const [rows,fields] = await pool.query(sql).catch(err => {throw err})
        result = rows;
        result = result.map(category => {
            const { description, ...categories } = category;
            return categories;
        });
        return result;
    }

    find = async (params = {}, operator = null) => {
        let result;
        let sql = `SELECT * FROM ${this.tableName}`;

        if (!Object.keys(params).length) {
            const [rows,fields] = await pool.query(sql).catch(err => {throw err})
            result = rows;
        } else {
            const { columnSet, values } = multipleColumnSet(params, 'user', operator)
            sql += ` WHERE ${columnSet}`;

            const [rows,fields] = await pool.query(sql, [...values]).catch(err => {throw err});
            result = rows;
        }

        result = result.map(user => {
            const { user_type, created, modified, ...users } = user;
            return users;
        });

        return result;
    }

    findOne = async (params, operator = null) => {
        const { columnSet, values } = multipleColumnSet(params, "user", operator);
        const sql = `SELECT * FROM ${this.tableName}
            WHERE ${columnSet}`;
    
        const [rows, fields] = await pool.query(sql, [...values]);
        let result = rows;
    
        result = result.map((user) => {
            const { user_type, created, modified, ...users } = user;
            return users;
        });
    
        // return back the first row (user)
        return result.length > 0 ? result[0] : null;
    };
    
    findById = async (id) => {
      try{
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const user = await pool.query(sql, [id]);
        return user;
      } catch (err) {
        throw err;
      }
    }
    
    checkEmails = async (params, user_id = null) => {
      const { columnSet, values } = multipleColumnSet(params, "user");
      
      // Add a condition to exclude the user with the specified user_id
      const sql = `SELECT * FROM ${this.tableName}
          WHERE ${columnSet} ${user_id ? `AND id != ${user_id}` : ""}`;
      console.log(sql);
      const [rows, fields] = await pool.query(sql, [...values]);
      let result = rows;
    
      result = result.map((user) => {
          const { user_type, created, modified, ...users } = user;
          return users;
      });
    
      // return back the first row (user)
      return result.length > 0 ? result[0] : null;
    };


    create = async ({username, email, user_type}) => {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
    
        const userData = {
          username: username,
          email: email,
          user_type: user_type,
          language: "English",
          created: new Date(),
          modified: new Date()
        };
        const [userResult] = await connection.query('INSERT INTO user SET ?', userData);
        const userId = userResult.insertId;
    
        const notificationData = {
          user_id: userId,
          notification_type: "both",
          latest_update: new Date()
        };
        const [notificationResult] = await connection.query('INSERT INTO user_notification SET ?', notificationData);
    
        const servicesData = {
          user_id: userId,
          device_access: 1,
          nurse_chat_access: 1,
          help_access: 1,
          faq_access: 1,
          medication_access: 0,
          pain_access: 0,
          visual_access: 0,
          profile_access: 1,
          share_data_access: 1,
          alexa_access: 1,
          google_assistant_access: 0,
          siri_access: 0
        };
        const [servicesResult] = await connection.query('INSERT INTO user_services SET ?', servicesData);
    
        await connection.commit();
    
        return userResult ? userResult.affectedRows : 0;
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }


    update = async (params, id) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `UPDATE user SET ${columnSet} WHERE id = ?`;

        const [result] = await pool.query(sql, [...values, id]);
        return result ? result.affectedRows : 0;
    }

    delete = async (id, username) => {
      try {
        await pool.query('START TRANSACTION');
    
        // Find all the rows in user_notification table that reference the user_id
        const selectSql = `SELECT id FROM user_notification WHERE user_id = ?`;
        const [rows] = await pool.query(selectSql, [id]);
    
        // Delete all the corresponding rows in user_notification table
        for (const row of rows) {
          const deleteSql = `DELETE FROM user_notification WHERE id = ?`;
          await pool.query(deleteSql, [row.id]);
        }
    
        // Delete all the corresponding rows in user_services table
        let deleteServicesSql = `DELETE FROM user_services WHERE user_id = ?`;
        await pool.query(deleteServicesSql, [id]);
        console.log(id,username);
        const user_type = await this.findUserType(username);
        // if the user is a patient delete data from following tables
        if (user_type === 1) {
          // Delete all the corresponding rows in patient_doctors table
          deleteServicesSql = `DELETE FROM patient_doctors WHERE patient_id = ?`;
          await pool.query(deleteServicesSql, [id]);
          // Delete all the corresponding rows in patient_friends table
          deleteServicesSql = `DELETE FROM patient_friends WHERE patient_id = ?`;
          await pool.query(deleteServicesSql, [id]);
          // Delete all the corresponding rows in patient_insurance table
          deleteServicesSql = `DELETE FROM patient_insurance WHERE patient_id = ?`;
          await pool.query(deleteServicesSql, [id]);
        }
        // Delete the row from the user table
        const deleteSql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const [result] = await pool.query(deleteSql, [id]);
    
        await pool.query('COMMIT');
        return result ? result.affectedRows : 0;
      } catch (error) {
        console.log(error);
        await pool.query('ROLLBACK');
        throw error;
      }
    };

    postShareData = async (shareData) => {
      try {
        // create the prepared statement
        const stmt = 'INSERT INTO share_data (patient_id, contact_type, contact_id, share_method, share_data_id) VALUES ?';
    
        // create an array of arrays for the values to be inserted
        const values = shareData.share_data_ids.map(id => [shareData.patient_id, shareData.contact_type, shareData.contact_id, shareData.share_method, id]);
    
        // execute the prepared statement with the values
        const [result] = await pool.query(stmt, [values]);
    
        // return the number of affected rows
        return result.affectedRows;
      } catch (error) {
        // log the error
        console.error(error);
    
        // throw a new error with a custom message
        throw new Error('Failed to insert share data into the database.');
      }
    };

}

module.exports = new UserModel;