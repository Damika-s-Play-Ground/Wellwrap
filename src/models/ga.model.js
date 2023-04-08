const pool = require("./db").promise();
const { multipleColumnSet } = require("../utils/common.utils");

class GAModel {
  tableName = "ga_data";

  find = async (params = {}) => {
    let result;
    let sql = `SELECT ${this.tableName}.* FROM ${this.tableName} INNER JOIN user ON user.id = ${this.tableName}.user_id INNER JOIN ga_question ON ga_question.id = ${this.tableName}.question_id`;

    if (!Object.keys(params).length) {
      sql += ` ORDER BY ${this.tableName}.created DESC, ${this.tableName}.question_id ASC`;
      const [rows, fields] = await pool.query(sql).catch((err) => {
        throw err;
      });
      result = rows;
    } else {
      sql += ` WHERE ga_question.is_active = 1`;
      let ga_values = [];
      if (params.ga) {
        const { columnSet, values } = multipleColumnSet(
          params.ga,
          this.tableName,
          "and"
        );
        sql += ` AND ${columnSet}`;
        ga_values = values;
      }

      let user_values = [];
      if (params.user) {
        const { columnSet, values } = multipleColumnSet(params.user, "user");
        sql += ` AND ${columnSet}`;
        user_values = values;
      }

      let qn_values = [];
      if (params.ga_question) {
        const { columnSet, values } = multipleColumnSet(
          params.ga_question,
          "ga_question"
        );
        qn_values = values;
        sql += ` AND ${columnSet}`;
      }
      let param_values = [].concat(ga_values, user_values, qn_values);

      sql += ` ORDER BY ${this.tableName}.created DESC, ${this.tableName}.question_id ASC`;

      console.log(sql);
      console.log(param_values);
      const [rows, fields] = await pool
        .query(sql, [...param_values])
        .catch((err) => {
          throw err;
        });
      result = rows;
    }

    result = result.map((ga) => {
      const { user_id, created, modified, ...ga_data } = ga;
      ga_data.timestamp = new Date(created).getTime() / 1000;
      return ga_data;
    });

    return result;
  };

  async findFAQs(username, tag) {
    const sql = `SELECT g.* FROM ga_faq_data AS g
            INNER JOIN user AS u ON g.user_id = u.id
            WHERE g.tag = ? AND u.username = ?`;

    const [rows, fields] = await pool.query(sql, [tag, username]);

    return rows;
  }
  async findFAQsAnswers(username, tag, created) {
    const sql = `SELECT * FROM ga_faq_data as g inner join user as u WHERE g.user_id = u.id and u.username = ? AND g.tag = ? AND g.created = ?;`;
    const [rows, fields] = await pool.query(sql, [tag, username, created]);

    return rows;
  }

  async createFAQ(user_id, tag, answers) {
    const sql = `INSERT INTO ga_faq_data (user_id, tag, question, answer, created, modified)
            VALUES ?`;

    const values = answers.map(({ question, answer }) => [
      user_id,
      tag,
      question,
      answer,
      new Date(),
      new Date(),
    ]);

    const [result] = await pool.query(sql, [values]);

    return result ? result.affectedRows : 0;
  }

  async findOne(params) {
    const { columnSet, values } = multipleColumnSet(
      params,
      this.tableName,
      "and"
    );

    const sql = `SELECT * FROM ${this.tableName}
        WHERE ${columnSet}`;

    const [rows, fields] = await pool.query(sql, [...values]);
    let result = rows;

    result = result.map((qn) => {
      const { created, modified, ...qns } = qn;
      return qns;
    });

    return result[0];
  }

  async findGroupBy(user_id, qn_type, tag) {
    try {
      let sql = `SELECT ${this.tableName}.* FROM ${this.tableName} INNER JOIN user ON user.id = ${this.tableName}.user_id INNER JOIN ga_question ON ga_question.id = ${this.tableName}.question_id`;
      sql += ` WHERE user.username = ? AND ga_question.type = ? AND ${this.tableName}.tag = ? GROUP BY ${this.tableName}.created ORDER BY ${this.tableName}.created DESC`;

      const [rows, fields] = await pool.query(sql, [user_id, qn_type, tag]);

      return Promise.resolve(rows);
    } catch (error) {
      console.log(error);
      return Promise.reject("System failed");
    }
  }

  create = async ({ qn_id, user_id, question, answer }) => {
    const datetime = new Date().toISOString().slice(0, 19).replace("T", " ");
    const sql = `INSERT INTO ${this.tableName} SET ?`;
    const data = {
      user_id: user_id,
      question_id: qn_id,
      question: question,
      answer: answer,
      created: datetime,
      modified: datetime,
    };

    const [result] = await pool.query(sql, data);
    return result ? result.affectedRows : 0;
  };

  multiCreate = async (data) => {
    let result = false;

    try {
      await pool.query("START TRANSACTION");
      const datetime = new Date().toISOString().slice(0, 19).replace("T", " ");

      for (let item of data) {
        /*let params = {
                    question_id: item.qn_id,
                    user_id: item.user_id
                }
                const qn = await this.findOne(params);*/
        if (false) {
          let params = {
            question_id: item.qn_id,
            question: item.question,
            answer: item.answer,
            tag: item.tag,
            modified: datetime,
          };
          await this.update(params, qn.id);
        } else {
          let sql = `INSERT INTO ${this.tableName} SET ?`;
          let data = {
            user_id: item.user_id,
            question_id: item.qn_id,
            question: item.question,
            answer: item.answer,
            tag: item.tag,
            created: datetime,
            modified: datetime,
          };
          let [rows] = await pool.query(sql, data);
        }
      }
      await pool.query("COMMIT");
      result = true;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.log(error);
    }

    return result;
  };

  async update(params, id) {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE id = ?`;

    const [result] = await pool.query(sql, [...values, id]);
    return result ? result.affectedRows : 0;
  }
}

module.exports = new GAModel();
