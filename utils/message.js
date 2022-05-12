const utils = require("../utils/util")
const SQL = require("../utils/sql")

/**
 * 生成点赞消息内容
 * @param {*} sender_id 用户ID
 * @param {*} receiver_id 接收者ID
 * @param {*} flock_id 所属圈子id
 * @param {*} task_id 所属计划ID
 * @param {*} record_id 记录ID
 * @returns 
 */
async function send_like_message(sender_id, receiver_id, flock_id, task_id, record_id) {
    if (sender_id == receiver_id) {
        return false
    } else {
        //查询信息是否存在，若存在改时间,改为未读
        let message_id = await SQL.message_exists_id(sender_id, receiver_id, flock_id, task_id, record_id)
        if (message_id) {
            let [newTime, hasRead] = [utils.formatTime(new Date()), 0]
            await SQL.message_update_date_hasRead_by_id_type(message_id, newTime, hasRead, 4)
                //修改消息的时间
            return true
        } else {
            let [content, time, url, hasRead] = ['', utils.formatTime(new Date()), `../detail/detail?id=${record_id}`, 0]
            let sql = `select nickName from user where id = ${sender_id}`

            let result = await utils.executeSQL(sql)
            result = result && JSON.parse(result)
            content = `<span class='deepen'>${result[0].nickName}</span>给你的打卡点赞了，<span class='click'>点击查看</span>`

            let sql1 = `insert into message(sender_id, receiver_id, flock_id,task_id,content, time, url,hasRead,type) values(${sender_id}, ${receiver_id},${flock_id},${task_id},"${content}", '${time}', '${url}',${hasRead},4)`
            await utils.executeSQL(sql1)
            return true
        }
    }

}
/**
 * 生成评论消息内容
 * @param {*} sender_id 用户ID
 * @param {*} receiver_id 接收者ID
 * @param {*} flock_id 所属圈子id
 * @param {*} task_id 所属计划ID
 * @param {*} record_id 记录ID
 * @returns 
 */
async function send_remark_message(sender_id, receiver_id, flock_id, task_id, record_id) {
    if (sender_id == receiver_id) {
        return false
    } else {
        let [content, time, url, hasRead] = ['', utils.formatTime(new Date()), `../detail/detail?id=${record_id}`, 0]
        let sql = `select nickName from user where id = ${sender_id}`

        let result = await utils.executeSQL(sql)
        result = result && JSON.parse(result)
        content = `<span class='deepen'>${result[0].nickName}</span>给你的打卡评论了，<span class='click'>点击查看</span>`

        let sql1 = `insert into message(sender_id, receiver_id, flock_id,task_id,content, time, url,hasRead,type) values(${sender_id}, ${receiver_id},${flock_id},${task_id},"${content}", '${time}', '${url}',${hasRead},3)`
        await utils.executeSQL(sql1)
        return true
    }
}

/**
 * 生成周期报告消息内容
 * @param task_name 计划名字
 */
async function send_report_message(task_name) {
    return `<span class='deepen'>${task_name}</span>的periodical report已生成，<span class='click'>点击查看</span>`
}

module.exports = {
    send_remark_message,
    send_like_message,
    send_report_message
}