const utils = require("../utils/util")

/**
 * 更新小组数据
 * @param {*} flock_id 圈子ID
 * @param {*} name 修改后的名字
 * @param {*} state 修改后的描述
 */
async function flock_update(flock_id, name, state) {
  let sql = `update flock set name="${name}",state="${state}" where id=${flock_id}`
  await utils.executeSQL(sql)
  return true
}
/**
 * 创建圈子
 * @param {*} id 
 * @param {*} creater_id 
 * @param {*} name 
 * @param {*} state 
 * @param {*} avatarUrl 
 * @param {*} type 
 */
async function flock_insert(id, creater_id, name, state, avatarUrl, type) {
  let sql1 = `insert into flock values(${id},${creater_id},'${name}','${state}','${avatarUrl}',0,0,'${type}')`
  await utils.executeSQL(sql1)

  let sql2 = `insert into joining(user_id,flock_id) values(${creater_id},${id})`
  await utils.executeSQL(sql2)
  return true

}
/**
 * 退出圈子
 * @param {*} flock_id 
 * @param {*} user_id 
 */
async function flock_quit(flock_id, user_id) {
  //删除joining记录
  let sql1 = `delete from joining where user_id =${user_id} and flock_id = ${flock_id}`
  await utils.executeSQL(sql1)
  //删除collect记录
  let sql2 = `delete collect.* from collect,task where collect.user_id = ${user_id} and collect .task_id = task.id and task.flock_id = ${flock_id}`
  await utils.executeSQL(sql2)
  //删除record记录
  let sql3 = `delete record.* from record,punch,task where record.task_id = task.id and task.flock_id = ${flock_id} and record.id = punch.record_id and punch.user_id = ${user_id}`
  await utils.executeSQL(sql3)
  //删除experience记录
  let sql4 = `delete from experience where writter_id = ${user_id} and flock_id = ${flock_id}`
  await utils.executeSQL(sql4)
}
/**
 * 获取圈子信息
 * @param {*} flock_id 
 */
async function flock_select_by_id(flock_id) {
  let sql = `select * from flock where id =${flock_id}`
  let res = await utils.executeSQL(sql)
  return res
}
/**
 * 查找圈子所有成员
 * @param {*} flock_id 
 */
async function flock_select_member(flock_id) {
  let sql = `select user.* from user,joining where joining.user_id = user.id and joining.flock_id = ${flock_id} `
  let res = await utils.executeSQL(sql)
  return res
}
/**
 * 查找管理员ID
 * @param {*} flock_id 圈子ID
 */
async function flock_select_amdin(flock_id) {
  let sql = `select creater_id from flock where id =${flock_id}`
  let admin = await utils.executeSQL(sql)
  return admin
}
/**
 * 获取用元气值排序后的圈子列表
 */
async function flock_select_order_by_value() {
  let sql = `select * from flock order by value desc` //定义sql语句
  let rList = await utils.executeSQL(sql) //执行
  return rList
}
/**
 * 检查该用户是否是管理员
 * @param {*} flock_id 
 * @param {*} user_id 
 */
async function flock_check_admin(flock_id, user_id) {
  let sql = `select creater_id from flock where id =${flock_id}`
  let admin = await utils.executeSQL(sql)
  admin = admin && JSON.parse(admin)
  admin = admin[0].creater_id
  return admin == user_id
}
/**
 * 注销圈子
 * @param {*} flock_id 圈子ID
 */
async function flock_delete(flock_id) {
  let sql = `delete from flock where id = ${flock_id}`
  await utils.executeSQL(sql)
  return true
}

/**
 * 获取指定类型的推荐小组
 * @param {*} type 小组类型
 * @param {*} user_id 用户id
 */
async function flock_select_by_type(type, user_id) {
  let sql = `select *,(select count(*) from task where flock_id = flock.id and isEnd = 0) as num_of_task from flock where id not in (select flock_id from joining where user_id = ${user_id}) and type = '${type}';` //定义sql语句
  let list = await utils.executeSQL(sql)
  return list
}
/**
 * 根据id查询用户记录
 * @param {*} id 用户id
 */
async function user_select_by_id(id) {
  let sql = `select * from user where id = ${id}`
  let res = await utils.executeSQL(sql)
  return res
}
/**
 * 插入评论记录
 * @param {*} user_id 评论者ID
 * @param {*} exper_id 评论的帖子ID
 * @param {*} time 评论时间
 * @param {*} content 评论内容
 */
async function remark_insert(user_id, exper_id, time, content) {
  let sql = `insert into remark(user_id, exper_id,time,content) values(${user_id},${exper_id},'${time}','${content}')`
  await utils.executeSQL(sql)
  return true
}
/**
 * 查找该用户所有消息
 * @param {*} user_id 用户ID
 */
async function message_select_by_id(user_id) {
  let sql = `select * from message where receiver_id = ${user_id} order by hasRead,time desc;`
  let list = utils.executeSQL(sql)
  return list
}
/**
 * 查询未读消息数
 * @param {*} user_id
 * @returns 消息数量 
 */
async function message_count_of_id_hasRead(user_id) {
  let sql = `select count(*) as num_of_message from message where receiver_id = ${user_id} and hasRead = 0`
  let res = await utils.executeSQL(sql)
  res = res && JSON.parse(res)
  return res[0].num_of_message
}
/**
 * 插入消息记录
 * @param {*} sender_id 发送者ID
 * @param {*} receiver_id 接收者ID
 * @param {*} content 消息内容
 * @param {*} time 发送时间
 * @param {*} url 点击连接
 * @param {*} type 消息类型
 */
async function message_insert(sender_id, receiver_id, content, time, url, type) {
  let sql = `insert into message(sender_id, receiver_id, content, time, url,hasRead,type) values(${sender_id}, ${receiver_id}, "${content}", '${time}', '${url}',0,${type})`
  await utils.executeSQL(sql)
}
/**
 * 消息已读
 * @param {*} message_id 消息ID
 */
async function message_read(message_id) {
  let sql = `update message set hasRead = 1 where id=${message_id}`
  await utils.executeSQL(sql)
  return true
}
/**
 * 新增计划
 * @param {*} id 
 * @param {*} name 
 * @param {*} state 
 * @param {*} creator 
 * @param {*} type 
 * @param {*} form 
 * @param {*} defaultText 
 * @param {*} flock_id 
 * @param {*} cycle 
 * @param {*} weekday 
 * @param {*} clock 
 * @param {*} start 
 * @param {*} end 
 */
async function task_insert(id, name, state, creator, type, form, defaultText, flock_id, cycle, weekday, clock, start, end) {
  let sql = `select type from typing where name='${type}'`
  let res = await utils.executeSQL(sql)
  res = res && JSON.parse(res)
  type = res[0].type
  //添加task记录
  let sql1 = `insert into task values(${id},'${name}','${state}',${creator},'${type}','${form}','${defaultText}',${flock_id},'${cycle}','${weekday}','${clock}','${start}','${end}',0)`;
  await utils.executeSQL(sql1)
  //添加participate记录
  let sql2 = `insert into participate(user_id,task_id) values(${creator},${id})`
  await utils.executeSQL(sql2)
  return true

}
/**
 * 获取计划参与人数
 * @param {*} task_id 计划ID
 */
async function task_member_num(task_id) {
  let sql = `select count(*) as num from participate where task_id = ${task_id}`
  let res = await utils.executeSQL(sql)
  res = res && JSON.parse(res)
  return res[0].num
}
async function task_update(task_id, name, state) {
  let sql = `update task set name="${name}",state="${state}" where id=${task_id}`
  await utils.executeSQL(sql)
  return 0
}
/**
 * 查询图标数据
 * @param {*} task_id 计划ID
 * @param {*} date 日期
 * @returns rate 打卡率
 */
async function task_charts_message(task_id, date) {
  for (let i = 0; i < date.length; i++) {
    date[i] = "'" + date[i] + "'"
  }
  let number = await task_member_num(task_id)
  // round(count(*)/${number},2)*100
  let sql = `select round(count(*)/${number},2)*100 as rate,date from record where task_id = ${task_id} and date in (${date}) group by date order by date`
  let res = await utils.executeSQL(sql)
  return res

}
/**
 * 查询打卡时间线需要的数据
 * @param {*} task_id 计划ID
 * @param {*} date 日期
 */
async function task_time_line(task_id, date) {
  let sql = `select user.nickName as name, time from record,user,punch where record.task_id = ${task_id} and record.date = '${date}' and record.id = punch.record_id and punch.user_id = user.id order by time desc `
  let list = await utils.executeSQL(sql)
  return list
}
/**
 * 用户退出计划
 * @param {*} user_id 用户ID
 * @param {*} task_id 计划ID
 */
async function task_quit(user_id, task_id) {
  //删除加入记录
  let sql1 = `delete from participate where user_id = ${user_id} and task_id = ${task_id}`
  await utils.executeSQL(sql1)
  //删除打卡记录
  let sql2 = `delete record.* from record,punch where record.task_id =  ${task_id} and record.id = punch.record_id and punch.user_id = ${user_id} `
  await utils.executeSQL(sql2)
  //删除收藏记录
  let sql3 = `delete from collect where user_id = ${user_id} and task_id = ${task_id}`
  await utils.executeSQL(sql3)
}
/**
 * 注销计划
 * @param {*} task_id 计划ID
 */
async function task_delete(task_id) {
  let sql = `delete from task where id = ${task_id}`
  await utils.executeSQL(sql)
  return 0
}
/**
 * 查找计划成员列表
 * @param {*} task_id 计划ID
 */
async function task_select_member(task_id) {
  let sql = `select user.* from user,participate as p where p.user_id = user.id and p.task_id = ${task_id} `
  let res = await utils.executeSQL(sql)
  return res
}
/**
 * 查找计划管理员
 * @param {*} task_id 计划ID
 */
async function task_select_amdin(task_id) {
  let sql = `select creator from task where id =${task_id}`
  let admin = await utils.executeSQL(sql)
  return admin
}
/**
 * 检查该用户是否是计划管理员
 * @param {*} task_id 计划ID
 * @param {*} user_id 用户ID
 */
async function task_check_amdin(task_id, user_id) {
  let sql = `select creator from task where id =${task_id}`
  let admin = await utils.executeSQL(sql)
  admin = admin && JSON.parse(admin)
  admin = admin[0].creator
  return admin == user_id
}
/**
 * 添加加入计划记录
 * @param {*} user_id 用户ID
 * @param {*} task_id 计划ID
 */
async function participate_insert(user_id, task_id) {
  let sql = `insert into participate(user_id,task_id) values(${user_id},${task_id})`
  await utils.executeSQL(sql)
  return 0
}
/**
 * 获取帖子列表
 * @param {*} user_id 当前用户ID
 */
async function experience_select(user_id) {
  let sql = `select e.id,e.content,e.time,e.writter_id,e.url,user.nickName as writter_name,user.avatarUrl as writter_url,(select count(*) from liking where exper_id = e.id) as num_of_like , (select count(*) from remark where exper_id = e.id) as num_of_remark ,exists (select id from liking where user_id =${user_id} and exper_id = e.id) as isLike from experience as e,user where user.id = e.writter_id order by e.time desc`
  let list = await utils.executeSQL(sql)
  return list
}
/**
 * 插入经验记录
 * @param {*} id 
 * @param {*} writter_id 
 * @param {*} flock_id 
 * @param {*} time 
 * @param {*} content 
 * @param {*} url 
 */
async function experience_insert(id, writter_id, flock_id, time, content, url) {
  let sql = `insert into experience values(${id},${writter_id},${flock_id},'${time}','${content}','${url}')`
  await utils.executeSQL(sql)
  return true
}
/**
 * 删除帖子
 * @param {*} id 
 */
async function experience_delete(id) {
  let sql = `delete from experience where id=${id}`
  await utils.executeSQL(sql)
  return true
}
/**
 * 新成员入圈
 * @param {*} user_id 
 * @param {*} flock_id 
 */
async function joining_insert(user_id, flock_id) {
  let sql = `insert into joining(user_id,flock_id) values(${user_id},${flock_id})`
  await utils.executeSQL(sql)
  return true
}
/**
 * 获取当前帖子下所有评论，包含点赞
 * @param {*} exper_id 帖子ID
 * @param {*} user_id 当前用户ID
 */
async function remark_select(exper_id, user_id) {
  let sql = `select remark.*,user.nickName,user.avatarUrl,exists (select id from liking where user_id =${user_id} and remark_id = remark.id and type = 0) as isLike,(remark.user_id = ${user_id}) as own,(select count(*) from liking where remark_id = remark.id and type = 0) as num_of_like  from remark,user where exper_id = ${exper_id} and user.id = remark.user_id order by remark.time desc;`
  let list = utils.executeSQL(sql)
  return list
}
/**
 * 删除评论
 * @param {*} id 评论id
 */
async function remark_delete(id) {
  let sql = `delete from remark where id=${id}`
  await utils.executeSQL(sql)
  return true
}
/**
 * 获取所有海报链接
 */
async function poter_select() {
  let sql = `select url from poster`
  let list = await utils.executeSQL(sql)
  return list
}
module.exports = {
  flock_update,
  flock_insert,
  flock_quit,
  flock_select_by_id,
  flock_select_member,
  flock_select_amdin,
  flock_select_order_by_value,
  flock_check_admin,
  flock_delete,
  flock_select_by_type,
  message_select_by_id,
  message_count_of_id_hasRead,
  message_insert,
  message_read,
  remark_insert,
  user_select_by_id,
  task_insert,
  task_member_num,
  task_update,
  task_charts_message,
  task_time_line,
  task_quit,
  task_delete,
  task_select_member,
  task_select_amdin,
  task_check_amdin,
  participate_insert,
  experience_select,
  experience_insert,
  experience_delete,
  joining_insert,
  remark_select,
  remark_delete,
  poter_select,
}