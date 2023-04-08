const db = require('./db');
const { multipleColumnSet } = require('../utils/common.utils');

class GAQuestionTypeModel{
    tableName = 'ga_question_type';

    async findpopup(qn_type) {
        let result;
        const sql = `SELECT popup_msg FROM ${this.tableName} WHERE name = ?`;
        const params = [qn_type];
        const [rows, fields] = await db.promise().query(sql, params).catch(err => {throw err});
        result = rows;
        return result;
    }
    
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

        result = result.map(ques_type => {
            const { is_active, created, modified, ...ques_types } = ques_type;
            return ques_types;
        });

        return result;
    }

    async findOne(params) {
        const { columnSet, values } = multipleColumnSet(params);

        const sql = `SELECT * FROM ${this.tableName}
        WHERE ${columnSet}`;

        const [rows,fields] = await db.promise().query(sql, [...values]);
        let result = rows;

        result = result.map(ques_type => {
            const { is_active, created, modified, ...ques_types } = ques_type;
            return ques_types;
        });

        // return back the first row (user)
        return result[0];
    }

    async create(type_data) {
        let result = false;

        try {
            const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const sql = `INSERT INTO ${this.tableName} SET ?`;
            const data = {
                name: type_data.name,
                link: type_data.link,
                alexa_link: type_data.alexa_link,
                alexa_skill_id: type_data.alexa_skill_id,
                is_active: 1,
                created: datetime,
                modified: datetime
            };

            const [result] = await db.promise().query(sql, data);
            return result ? result.affectedRows : 0;
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

module.exports = new GAQuestionTypeModel;