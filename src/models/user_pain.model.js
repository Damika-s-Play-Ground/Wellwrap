const db = require('./db');
const { multipleColumnSet } = require('../utils/common.utils');

class UserPainModel {
    tableName = 'user_pain_data';

    find = async (params = {}) => {
        let result = [];
        let sql = `SELECT ${this.tableName}.* FROM ${this.tableName} INNER JOIN user ON user.id = ${this.tableName}.user_id`;

        if (!Object.keys(params).length) {
            const [rows,fields] = await db.promise().query(sql).catch(err => {throw err});
            result = rows;
        } else {
            const { columnSet, values } = multipleColumnSet(params, 'user')
            sql += ` WHERE ${columnSet}`;

            const [rows,fields] = await db.promise().query(sql, [...values]).catch(err => {throw err});
            result = rows;
        }

        result = result.map(pain => {
            const { user_id, created, modified, ...pains } = pain;
            return pains;
        });

        return result;
    }

    create = async ({user_id, pain_number, timestamp}) => {
        const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const sql = `INSERT INTO ${this.tableName} SET ?`;
        const data = {
            user_id: user_id,
            pain_number: pain_number,
            timestamp: timestamp,
            created: datetime,
            modified: datetime
        };

        const [result] = await db.promise().query(sql, data);
        return result ? result.affectedRows : 0;
    }

    update = async (params, id) => {
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

module.exports = new UserPainModel;