const db = require('./db');
const { multipleColumnSet } = require('../utils/common.utils');

class GAQuestionModel {
    tableName = 'ga_question';

    async find(params = {}) {
        let result;
        let sql = `SELECT * FROM ${this.tableName}`;

        if (!Object.keys(params).length) {
            const [rows,fields] = await db.promise().query(sql).catch(err => {throw err})
            result = rows;
        } else {
            const { columnSet, values } = multipleColumnSet(params)
            sql += ` WHERE ${columnSet}`;

            const [rows,fields] = await db.promise().query(sql, [...values]).catch(err => {throw err});
            result = rows;
        }

        result = result.map(question => {
            const {is_active, created, modified, ...questions } = question;
            return questions;
        });

        return result;
    }

    async findOne(params) {
        const { columnSet, values } = multipleColumnSet(params);

        const sql = `SELECT * FROM ${this.tableName}
        WHERE ${columnSet}`;

        const [rows,fields] = await db.promise().query(sql, [...values]);
        let result = rows;

        result = result.map(qn => {
            const { is_active, created, modified, ...qns } = qn;
            return qns;
        });

        return result[0];
    }

    async create(qn_data) {
        let result = false;

        try {
            const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const sql = `INSERT INTO ${this.tableName} SET ?`;
            const data = {
                question: qn_data.question,
                type: qn_data.type,
                is_active: 1,
                created: datetime,
                modified: datetime
            };

            const [result] = await db.promise().query(sql, data);
            return result ? result.insertId : 0;
        } catch (error) {
            console.log(error);
        }
        return result;
    }

    async update(params, id) {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE id = ?`;

        const [result] = await db.promise().query(sql, [...values, id]);
        return result ? result.affectedRows : 0;
    }

    delete = async (id) => {
        const sql = `DELETE FROM ${this.tableName}
        WHERE id = ?`;

        const [result] = await db.promise().query(sql, [id]);
        return result ? result.affectedRows : 0;
    }
}

module.exports = new GAQuestionModel;