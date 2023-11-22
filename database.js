const { MongoClient } = require('mongodb');
// brew services stop mongodb-community
// brew services start mongodb/brew/mongodb-community

const uri = 'mongodb://127.0.0.1:27017/xundao_db';
const client = new MongoClient(uri);
/**
 *  输入卡密，直接使用
 * @param {*} password 卡密
 * @returns  code： 返回码【success/failed/overdue】：成功success
 * @returns  msg: 提示信息
 */
const passwUse = async (password) => {
    try {
        const db = client.db('xundao_db');
        const col = db.collection('passwords_col');

        const findResult = await col.findOne({ password });
        if (!findResult) {
            return {
                code: 'failed',
                msg: '卡密不存在，请联系客服购买'
            }
        }

        const { status, time, endTime } = findResult;

        if (status === 'init') {
            const now = new Date();
            const end = now.setDate(now.getDate() + Number(time));

            const updateResult = await col.updateOne({ password }, {
                $set: {
                    status: 'used',
                    startTime: now,
                    endTime: new Date(end)
                }
            });

            if (updateResult.modifiedCount > 0) {
                return {
                    code: 'success',
                    msg: '成功启动'
                }
            }
        }

        const now = new Date();
        const isOverdue = endTime - now;
        if (isOverdue > 0) {
            return {
                code: 'success',
                msg: '成功启动'
            }
        }

        return {
            code: 'overdue',
            msg: '过期了，请联系客服续单'
        }

    } catch (err) {
        console.error(err);
        throw err;
    }
}

const run = async (type, limit, updateData) => {
    try {
        const db = client.db('xundao_db');
        const col = db.collection('passwords_col');
        let result = null;
        switch (type) {
            case 'find':
                result = await col.find(limit).toArray();
                break;
            case 'updateStatus':
                result = await col.updateOne(limit, updateData);
                break;
            case 'insert':
                result = await col.insertOne({ ...updateData, createTime: new Date(), status: 'init' });
                break;
            default:
                throw new Error('Unsupported operation type');
        }
        return result;

    } catch (err) {
        console.error(err);
        throw err;
    } 
}
/**
 * 生成卡密
 * @param {*} insertData ：插入信息对象   {time：时长}
 * @returns{*}  { code: success/failed ,msg,password}
 */
const generate = async (time) => {
    try {
        let newPassword = '';
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < 15; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            newPassword += characters.charAt(randomIndex);
        }

        const insertResult = await run('insert', {}, { time, password: newPassword });
        if (insertResult) {
            return {
                code: 'success',
                msg: `新增卡密成功:${time}天`,
                password: newPassword
            }
        }
        return {
            code: 'failed',
            msg: '新增卡密失败',
            password: newPassword
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {
    passwUse,
    generate
}