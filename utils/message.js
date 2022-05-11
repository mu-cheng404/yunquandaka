const utils = require("../utils/util")
const sql = require("../utils/sql")
    /**
     * 生成申请加入消息内容
     * @param user_id 用户ID 
     * @param receiver_id 接受者ID
     * @param flock_id 圈子ID
     */
async function send_apply_message(user_id, receiver_id, flock_id) {
    //定义
    let [sender_id, content, time, url] = [user_id, '', utils.formatTime(new Date()), `../flock/flock?id=${flock_id}`]
    //生成内容
    let sql1 = `select user.nickName as user_name, flock.name as flock_name from user, flock where user.id = ${user_id} and flock.id = ${flock_id}`
    let result = await utils.executeSQL(sql1)
    result = result && JSON.parse(result)
    let { user_name, flock_name } = result[0]

    content = `<span class='deepen'>${user_name}</span>申请加入<span class='deepen'>${flock_name}</span>圈子<span class='click'>点击处理</span>`
    let sql2 = `insert into message(sender_id, receiver_id,flock_id, content, time, url,hasRead,type,state) values(${sender_id}, ${receiver_id},${flock_id}, "${content}", '${time}', '${url}',0,1,'未处理')`
    await utils.executeSQL(sql2)
    return true
}
/**
 * 生成点赞消息内容
 * @param user_id 用户ID
 * @param receiver_id 接收者ID
 * @param object_id 对象ID
 */
async function send_like_message(user_id, receiver_id, object_id) {
    if (user_id == receiver_id) {
        return false
    } else {
        let [sender_id, content, time, url, hasRead] = [user_id, '', utils.formatTime(new Date()), `../detail/detail?id=${object_id}`, 0]
        let sql = `select nickName from user where id = ${user_id}`
        let result = await utils.executeSQL(sql)
        result = result && JSON.parse(result)

        content = `<span class='deepen'>${result[0].nickName}</span>给你的分享点赞了，<span class='click'>点击查看</span>`

        let sql1 = `insert into message(sender_id, receiver_id, content, time, url,hasRead,type) values(${sender_id}, ${receiver_id}, "${content}", '${time}', '${url}',${hasRead},4)`
        await utils.executeSQL(sql1)
        return true
    }

}
/**
 * 生成评论消息内容
 * @param {*} user_id 发送者ID
 * @param {*} receiver_id 接收者ID
 * @param {*} object_id 心得帖子ID
 */
async function send_remark_message(user_id, receiver_id, object_id) {
    if (user_id == receiver_id) {
        return false
    } else {
        let [sender_id, content, time, url] = [user_id, '', utils.formatTime(new Date()), `../detail/detail?id=${object_id}`]

        let result = await sql.user_select_by_id(user_id)
        result = result && JSON.parse(result)

        content = `<span class='deepen'>${result[0].nickName}</span>评论了你的心得分享，<span class='click'>点击查看</span>`

        await sql.message_insert(sender_id, receiver_id, content, time, url, 3)
        return true
    }
}
/**
 * 发送打卡邀请消息
 * @param {*} sender_id 发送人ID
 * @param {*} receiver_id 接收人ID
 * @param {*} flock_id 圈子ID
 * @param {*} task_id 任务ID
 * @returns 
 */
async function send_invitation_message(sender_id, receiver_id, flock_id, task_id) {

    let sql1 = `select user.nickName as user_name ,flock.name as flock_name,task.name as task_name from user,flock,task where user.id = ${sender_id} and flock.id = ${flock_id} and task.id = ${task_id}`
    let res = await utils.executeSQL(sql1)
    res = res && JSON.parse(res)
    let { flock_name, user_name, task_name } = res[0]
    let content = `<span class='deepen'>${flock_name}</span> 圈子中<span class='deepen'>${user_name}</span>邀请你进行<span class='deepen'>${task_name}</span>的打卡计划 <span class='click'>点击加入</span>`

    let [time, url] = [utils.formatTime(new Date()), ``]

    let sql2 = `insert into message(sender_id, receiver_id,flock_id, task_id,content, time, url,hasRead,type,state) values(${sender_id}, ${receiver_id},${flock_id},${task_id}, "${content}", '${time}', '${url}',0,2,'未处理')`
    await utils.executeSQL(sql2)
    return true
}
/**
 * 生成周期报告消息内容
 * @param task_name 计划名字
 */
async function send_report_message(task_name) {
    return `<span class='deepen'>${task_name}</span>的periodical report已生成，<span class='click'>点击查看</span>`
}

module.exports = {
    send_apply_message,
    send_invitation_message,
    send_remark_message,
    send_like_message,
    send_report_message
}