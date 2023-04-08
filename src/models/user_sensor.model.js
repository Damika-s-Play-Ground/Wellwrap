const db = require('./db');
const { multipleColumnSet } = require('../utils/common.utils');

class UserSensorModel {
    tableName = 'user_sensor_data';

    find = async (params = {}) => {
        let result = [];
        let sql = `SELECT ${this.tableName}.* FROM ${this.tableName} INNER JOIN user ON user.id = ${this.tableName}.user_id`;

        if (!Object.keys(params).length) {
            const [rows,fields] = await db.promise().query(sql).catch(err => {throw err})
            result = rows;
        } else {
            const { columnSet, values } = multipleColumnSet(params, 'user')
            sql += ` WHERE ${columnSet}`;

            const [rows,fields] = await db.promise().query(sql, [...values]).catch(err => {throw err});
            result = rows;
        }

        result = result.map(sensor => {
            const { user_id, created, modified, ...sensors } = sensor;
            return sensors;
        });

        return result;
    }

    create = async ({user_id, bp, temp, timestamp}) => {
        const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const sql = `INSERT INTO ${this.tableName} SET ?`;
        const data = {
            user_id: user_id,
            bp: bp,
            temp: temp,
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

module.exports = new UserSensorModel;