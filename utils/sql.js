const utils = require("../utils/util")

/**
 * 插入记录
 * @param {*} id 
 * @param {*} uid 
 * @param {*} tid 
 * @param {*} fid 
 * @param {*} duration 
 * @param {*} sum   
 * @param {*} rate 
 * @param {*} grade 
 */
async function accomplish_insert(id, uid, tid, fid, duration, sum, rate, grade) {
    let sql = `insert into accomplish(id,user_id,task_id,flock_id,duration,sum,rate,grade) values(${id},${uid},${tid},${fid}},${duration},${sum},'${rate}',${grade})`
    await utils.executeSQL(sql)
    return true
}
/**
 * 给历史记录打分
 * @param {*} id 
 * @param {*} grade 
 */
async function accomplish_update_grade(id, grade) {
    let sql = `update accomplish set grade = ${grade} where id = ${id}`
    await utils.executeSQL(sql)
    return true
}
/**
 * 删除历史记录
 * @param {*} id 
 */
async function accomplish_delete(id) {
    let sql = `delete from accomplish where id = ${id}`
    await utils.executeSQL(sql)
    return true
}
/**
 * 查找用户历史
 * 计划name
 * @param {*} uid 
 */
async function accomplish_select(uid) {
    let sql = `select a.*,flock.name as fname,task.name as tname from accomplish,flock,task as a where a.user_id = ${uid} and flock.id = a.flock_id and task.id = a.task_id`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 * 更新小组数据
 * @param {*} flock_id 圈子ID
 * @param {*} name 修改后的名字
 * @param {*} state 修改后的描述
 * @param {*} type 修改后的类型
 * @param {*} avatarUrl 修改后的头像链接
 */
async function flock_update(flock_id, name, state, type, avatarUrl) {
    let sql = `update flock set name="${name}",state="${state}",type="${type}",avatarUrl="${avatarUrl}" where id=${flock_id}`
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
    let sql1 = `insert into flock values(${id},${creater_id},'${name}','${state}','${avatarUrl}',0,0,'${type}','负责人点击设置管理小组')`
    await utils.executeSQL(sql1)
    let nickName = await user_select_name_by_id(creater_id)
    let sql2 = `insert into joining(user_id,flock_id,nickName) values(${creater_id},${id},'${nickName}')`
    await utils.executeSQL(sql2)
    return true

}
/**
 * 修改通知
 * @param {*} fid 
 * @param {*} notice 
 * @returns 
 */
async function flock_update_notice(fid, notice) {
    let sql = `update flock set notice = '${notice}' where id = ${fid}`;
    await utils.executeSQL(sql);
    return true;
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
    let sql3 = `delete record.* from record,task where record.task_id = task.id and task.flock_id = ${flock_id} and record.user_id = ${user_id}`
    await utils.executeSQL(sql3)
        // //删除experience记录
        // let sql4 = `delete from experience where writter_id = ${user_id} and flock_id = ${flock_id}`
        // await utils.executeSQL(sql4)
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
 * 获取所有圈子id
 */
async function flock_select_all() {
    let sql = `select id from flock where flock.name!='hello！'`
    let res = await utils.executeSQL(sql)
    return res
}
/**
 * 查找该用户所有圈子以及该圈子人数
 * 排序：创建的>参加的
 * @param {*} user_id 用户id
 */
async function flock_select_count_by_uid(user_id) {
    let sql = `select *,(creater_id = ${user_id}) as admin,(select count(*) from joining where flock_id = flock.id) as num_of_member from flock where id in ( select flock_id from joining where user_id = ${user_id}) order by admin desc,id`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 * 查找圈子所有成员
 * @param {*} flock_id 
 */
async function flock_select_member(flock_id) {
    let sql = `select user.avatarUrl,user.id,joining.nickName from user,joining where joining.user_id = user.id and joining.flock_id = ${flock_id} `
    let res = await utils.executeSQL(sql)
    return res
}
/**
 * 查找圈子所有成员(不包括自己)
 * @param {*} flock_id 
 */
async function flock_select_member_expect_creater(flock_id) {
    let sql = `select user.avatarUrl,user.id,joining.nickName from user,joining where joining.user_id = user.id and joining.flock_id = ${flock_id} and user_id not in (select creater_id from  flock where id=${flock_id} )`
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
 * 查询小组通告
 * @param {*} flock_id 
 * @returns 
 */
async function flock_select_notice(flock_id) {
    let sql = `select notice from flock where id =${flock_id}`;
    let notice = await utils.executeSQL(sql);
    notice = notice && JSON.parse(notice);
    return notice[0].notice;
}
/**
 * 获取用元气值排序后的圈子列表
 * 
 */
async function flock_select_order_by_value(date) {
    //获取所有圈子id
    // let flocks = await flock_select_all()
    //计算计划打卡率
    // select (select count(*) from record where record.task_id = task.id and record.date = "${date}")/(select count(*) from joining where joining.flock_id = flock.id)  from task where task.flock_id = flock.id
    //计算计划平均值
    // let sql = `select count(*) from record,task where record.task_id = task.id and record.date = "${date}"`
    // let sql = `select count(*) from joining,flock where joining.flock_id = flock.id`
    let sql = `select flock.id as fid,task.id as tid,task.name as tname,flock.name as fname,flock.avatarUrl as url, round((select count(distinct user_id) from record where record.task_id = task.id and record.date = "${date}")/(select count(distinct joining.id) from joining where joining.flock_id = flock.id)*100,2) as ratio from task,flock where task.flock_id = flock.id and flock.name!='hello！' order by ratio desc`
        // let sql = `select flock.*, avg(value) as a from flock order by a desc`
        // let sql = `select avg(radio) from (select (select count(*) from record where record.task_id = task.id and record.date = "${date}")/(select count(*) from joining where joining.flock_id = flock.id) as ratio from task,flock)`
        //定义sql语句
    let rList = await utils.executeSQL(sql) //执行
    return rList
}
/**
 * 检查该用户是否是管理员
 * @param {*} flock_id 
 * @param {*} user_id 
 */
async function flock_check_admin(flock_id, user_id) {
    let sql = `select creater_id from flock where id = ${flock_id}`
    let admin = await utils.executeSQL(sql)
    admin = admin && JSON.parse(admin)
    admin = admin[0].creater_id
    return admin == user_id
}
/**
 * 检查用户是否在圈子中
 * @param {*} flock_id 
 * @param {*} user_id 
 */
async function flock_check_member(flock_id, user_id) {
    let sql = `select 1 as flag from joining where flock_id = ${flock_id} and user_id = ${user_id} limit 1`
    let flag = await utils.executeSQL(sql)
    if (flag == "[]") return 0;
    else {
        flag = flag && JSON.parse(flag)
        return flag[0].flag
    }
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
    let sql = `select *,(select count(*) from task where flock_id = flock.id and isEnd = 0) as num_of_task from flock where id not in (select flock_id from joining where user_id = ${user_id}) and type = '${type}' and flock.name!='hello！';` //定义sql语句
    let list = await utils.executeSQL(sql)
    return list
}
/**
 * 获取推荐小组（随机）
 * @param {*} null
 * @returns {id,name} 小组id和名称
 */
async function flock_select_recommandList() {
    let sql = `select id,name from flock where flock.name!='hello！' order by rand()  limit 20;`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 * 根据计划id返回小组id
 * @param {*} tid 计划id
 * @returns 
 */
async function flock_select_fid_by_tid(tid) {
    let sql = `select flock_id from task where id = ${tid}`
    let id = await utils.executeSQL(sql)
    id = id && JSON.parse(id)
    id = id[0].flock_id
    return id
}
/**
 * 根据计划id返回计划name
 * @param {*} tid 计划id
 * @returns 
 */
async function task_select_name_by_tid(tid) {
    let sql = `select name from task where id = ${tid}`
    let name = await utils.executeSQL(sql)
    name = name && JSON.parse(name)
    name = name[0].name
    return name
}
/**
 * 根据value模糊查找，排除掉用户已经加入的
 * @param {*} user_id 用户id
 * @param {*} value 模糊查找的值（id或者名称）
 */
async function flock_search(user_id, value) {
    let sql = `select * from flock where id like '%${value}%' or name like '%${value}%' and name !='hello！'`
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
 * 选择圈子下的所有计划，附加当前用户的收藏信息
 * @param {*} flock_id 
 * @param {*} user_id 
 * @returns 
 */
async function task_select_by_fid_uid(flock_id, user_id) {
    let sql = `select task.* ,(creator = ${user_id}) as admin,(select nickName from user where task.creator = user.id) as creator,exists (select id from collect where task_id=task.id and user_id=${user_id}) as collect from task where task.flock_id = ${flock_id} order by collect desc,task.name`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 * 获取任务列表（携带打卡信息和收藏信息）
 * @param {*} user_id 用户id
 * @param {*} date 当前日期
 */
async function task_select_by_uid_and_over(user_id, date) {
    let sql = `select task.*,(creator = ${user_id}) as admin,(select nickName from user where task.creator = user.id) as creator,flock.name as flock_name,exists(select record.id from record where record.date='${date}' and record.task_id = task.id and record.user_id = ${user_id}) as over from task,flock,joining where joining.user_id = ${user_id} and joining.flock_id = flock.id and flock.id = task.flock_id and exists(select id from collect where task_id = task.id and user_id = ${user_id}) order by over,admin desc,end,start,id `
    let list = await utils.executeSQL(sql)
    return list

}
/**
 * 插入评论记录
 * @param {*} user_id 评论者ID
 * @param {*} record_id 评论的帖子ID
 * @param {*} time 评论时间
 * @param {*} content 评论内容
 */
async function remark_insert(user_id, record_id, time, content) {
    let sql = `insert into remark(user_id, record_id,time,content,like_num) values(${user_id},${record_id},'${time}','${content}',0)`
    await utils.executeSQL(sql)
    return true
}
/**
 * 评论点赞
 * @param {*} rid 评论id
 * @param {*} uid 用户id
 * @returns 
 */
async function remark_like(rid, uid) {
    let sql = `update remark set like_num = like_num + 1 where id = ${rid}`
    await utils.executeSQL(sql)
    let sql1 = `insert remarklike(remark_id,user_id) values(${rid},${uid})`
    await utils.executeSQL(sql1)
    return 0
}
/**
 * 评论取消点赞
 * @param {*} rid 评论id
 * @param {*} uid 用户id
 * @returns 
 */
async function remark_cancel_like(rid, uid) {
    let sql = `update remark set like_num = like_num - 1 where id = ${rid}`
    await utils.executeSQL(sql)
    let sql1 = `delete from remarklike where remark_id = ${rid} and user_id = ${uid}`
    await utils.executeSQL(sql1)
    return 0
}
/**
 * 插入用户数据 
 * @param {*} id 用户id
 * @param {*} openid openid
 * @param {*} nickName 昵称
 * @param {*} avatarUrl 头像
 */
async function user_insert(id, openid, nickName, avatarUrl) {
    let sql = `insert into user values(${id},'${openid}','${nickName}','${avatarUrl}')`
    await utils.executeSQL(sql)
    return true
}
/**
 *  查询某个计划某个时间未打卡用户(日计划)
 * @param {*} task_id 
 * @param {*} date 
 */
async function user_select_task_uncover_day(task_id, date) {
    let sql = `select user.avatarUrl,user.id,joining.nickName from user,joining,task where task.id = ${task_id} and task.flock_id = joining.flock_id and joining.user_id = user.id and user.id not in (select distinct user_id from record where record.date = '${date}' and record.task_id = ${task_id})`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 *  查询某个计划某个时间未打卡用户（周计划）
 * @param {*} task_id 
 * @param {*} start 开始时间 
 * @param {*} date 结束时间
 */
async function user_select_task_uncover_week(task_id, start, end) {
    let sql = `select user.avatarUrl,user.id,joining.nickName from user,joining,task where task.id = ${task_id} and task.flock_id = joining.flock_id and joining.user_id = user.id and user.id not in (select distinct user_id from record where record.date >= '${start}' and record.date <= '${end}' and record.task_id = ${task_id})`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 *  查询某个计划某个时间已打卡（日计划）
 * @param {*} task_id 
 * @param {*} date 
 */
async function user_select_task_cover_day(task_id, date) {

    let sql = `select user.avatarUrl,user.id,joining.nickName from user,joining,task where task.id = ${task_id} and task.flock_id = joining.flock_id and joining.user_id = user.id and user.id in (select distinct user_id from record where record.date = '${date}' and record.task_id = ${task_id})`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 *  查询某个计划某个时间已打卡（周计划）
 * @param {*} task_id 
 * @param {*} start 
 * @param {*} end 
 */
async function user_select_task_cover_week(task_id, start, end) {

    let sql = `select user.avatarUrl,user.id,joining.nickName from user,joining,task where task.id = ${task_id} and task.flock_id = joining.flock_id and joining.user_id = user.id and user.id in (select distinct user_id from record where record.date >= '${start}' and record.date <= '${end}' and record.task_id = ${task_id})`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 * 根据用户id查询openid
 * @param {*} uid 用户id
 */
async function user_select_openid_by_uid(uid) {
    let sql = `select openid from user where id = ${uid}`
    let openid = await utils.executeSQL(sql)
    openid = openid && JSON.parse(openid)
    return openid[0].openid
}
/**
 * 通过Openid寻找id
 * @param {*} openid 
 * @returns 
 */
async function user_select_id_by_openid(openid) {
    let sql = `select id from user where openid = '${openid}'`;
    let id = await utils.executeSQL(sql);
    if (id == '[]') {
        return false;
    } else {
        id = id && JSON.parse(id);
        return id[0].id;
    }
}
/**
 * 查找用户姓名
 * @param {*} uid 
 * @returns 
 */
async function user_select_name_by_id(uid) {
    let sql = `select nickName from user where id = ${uid}`
    let name = await utils.executeSQL(sql)
    name = name && JSON.parse(name)
    return name[0].nickName
}
/**
 * 查询消息是否存在，如果消息存在返回id如果不存在返回0
 * @param {*} sender_id 
 * @param {*} receiver_id 
 * @param {*} flock_id 
 * @param {*} task_id 
 * @param {*} record_id 
 */
async function message_exists_id(sender_id, receiver_id, flock_id, task_id, record_id) {
    let sql = `select id from message where sender_id = ${sender_id} and receiver_id = ${receiver_id} and flock_id = ${flock_id} and task_id = ${task_id} and url = '../detail/detail?id=${record_id}'`
    let res = await utils.executeSQL(sql)
    if (res == "[]") {
        return 0
    } else {
        res = res && JSON.parse(res)
        return res[0].id
    }
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
 * 根据消息的一些信息查找消息ID(默认消息记录存在)
 * @param {*} sender_id 
 * @param {*} receiver_id 
 * @param {*} flock_id 
 * @param {*} task_id 
 */
async function message_select_id(sender_id, receiver_id, flock_id, task_id) {
    let sql = `select id from message where sender_id = ${sender_id} and receiver_id = ${receiver_id} and flock_id = ${flock_id}` + `${task_id?' and task_id='+task_id:''}`
    let res = await utils.executeSQL(sql)
    res = res && JSON.parse(res)
    return res[0].id
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
async function message_insert(sender_id, receiver_id, flock_id, task_id, content, time, url, type) {
    let sql = `insert into message(sender_id, receiver_id,flock_id,task_id,content, time, url,hasRead,type,state) values(${sender_id}, ${receiver_id}, ${flock_id},${task_id},"${content}",'${time}', '${url}',0,${type},'未处理')`
    console.log(sql)
    await utils.executeSQL(sql)
}
/**
 * 根据ID删除消息记录
 * @param {*} message_id 
 */
async function message_delete_by_id(message_id) {
    let sql = `delete from message where id = ${message_id}`
    await utils.executeSQL(sql)
    return 0
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
 * 消息状态设置成同意
 * @param {*} message_id 
 * @param {*} state
 */
async function message_update_state(message_id, state) {
    let sql = `update message set hasRead = 1,state='${state}' where id=${message_id}`
    await utils.executeSQL(sql)
    return true
}
/**
 * 检查用户是否已经发送申请，以及发送申请后的状态
 * @param {*} sender_id 
 * @param {*} receiver_id 
 * @param {*} flock_id 
 * @param {*} task_id 
 */
async function message_check_hasSend_and_state(sender_id, receiver_id, flock_id, task_id) {
    let sql = `select state from message where sender_id = ${sender_id} and receiver_id = ${receiver_id} and flock_id = ${flock_id}` + `${task_id?' and task_id='+task_id:''}`
    let res = await utils.executeSQL(sql)
    if (res == '[]') {
        return 0
    } else {
        res = res && JSON.parse(res)
        return res[0].state
    }
    return res
}
/**
 * 更新消息的日期，设置成未读
 * @param {*} message_id 消息
 * @param {*} newTime 新时间
 * @param {*} hasRead 已读或者未读
 * @param {*} type 类型
 * @returns 
 */
async function message_update_date_hasRead_by_id_type(message_id, newTime, hasRead, type) {
    let sql = `update message set time = '${newTime}', hasRead = ${hasRead} where id = ${message_id}`
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
    let sql = `select count(*) as num from joining,task where task.id = ${task_id} and joining.flock_id = task.flock_id`
    let res = await utils.executeSQL(sql)
    res = res && JSON.parse(res)
    return res[0].num
}
/**
 * 修改计划基本信息
 * @param {*} task_id 
 * @param {*} name 
 * @param {*} state 
 * @returns 
 */
async function task_update(task_id, name, state) {
    let sql = `update task set name="${name}",state="${state}" where id=${task_id}`
    await utils.executeSQL(sql)
    return 0
}
/**
 * 修改计划的大部分信息
 * @param {*} id 
 * @param {*} name 
 * @param {*} state 
 * @param {*} type 
 * @param {*} form 
 * @param {*} defaultText 
 * @param {*} cycle 
 * @param {*} weekday 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
async function task_update_2(id, name, state, type, form, defaultText, cycle, weekday, start, end) {
    let sql = `update task set name="${name}",state="${state}",type="${type}",form="${form}",defaultText="${defaultText}",start="${start}",end="${end}",cycle="${cycle}",weekday="${weekday}" where id=${id}`
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
    let sql = `select round(count(distinct user_id)/${number},2)*100 as rate,date from record where task_id = ${task_id} and date in (${date}) group by date order by date`
    let res = await utils.executeSQL(sql)
    return res

}
/**
 * 查询打卡时间线需要的数据(日计划)
 * @param {*} task_id 计划ID
 * @param {*} date 日期
 */
async function task_time_line_day(task_id, date) {
    let sql = `select distinct joining.nickName as nickName, time,date from record,joining where joining.user_id = record.user_id and joining.flock_id = record.flock_id and record.task_id = ${task_id} and record.date = '${date}' order by time desc`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 * 查询打卡时间线需要的数据（周计划）
 * @param {*} task_id 计划ID
 * @param {*} start 周一
 * @param {*} end 周末
 */
async function task_time_line_week(task_id, start, end) {
    let sql = `select distinct joining.nickName as nickName, time,date from record,joining where joining.user_id = record.user_id and joining.flock_id = record.flock_id and record.task_id = ${task_id} and record.date >= '${start}' and record.date <= '${end}' order by time desc,date`
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
    let sql2 = `delete record.* from record where record.task_id =  ${task_id} and record.user_id = ${user_id} `
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
 * 查找计划成员列表(除了创建者)
 * @param {*} task_id 计划ID
 */
async function task_select_member_expect_creator(task_id) {
    let sql = `select user.* from user,participate as  p ,task  where p.user_id = user.id and p.task_id = ${task_id} and P.task_id = task.id and  P.task_id != task.creator`
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
 * 查询计划所有基本信息
 * @param {*} task_id 计划id
 */
async function task_select_by_id(task_id) {
    let sql = `select * from task where id = ${task_id}`
    let task = await utils.executeSQL(sql)
    return task
}
/**
 * 查询任务所属圈子id(圈子必须存在)
 * @param {*} task_id 
 */
async function task_select_flock(task_id) {
    let sql = `select flock_id from task where id = ${task_id}`
    let id = await utils.executeSQL(sql)
    id = id && JSON.parse(id)
    return id[0].flock_id
}
/**
 * 查询连续打卡天数
 * @param {*} task_id 计划id
 * @param {*} user_id 用户id 
 */
async function task_query_continuous(task_id, user_id) {
    let sql = `select distinct date from record where task_id = ${task_id} and user_id = ${user_id} order by date desc`
    let list = await utils.executeSQL(sql)
    list = list && JSON.parse(list)
    let con = 0
    if (list.length == 0) {
        return 0
    } else if (list[0].date != utils.getCurrentFormatedDate()) {
        return 0
    } else {
        for (let i = 0; i < list.length - 1; i++) {
            let last = utils.getYesterday(list[i].date)
            console.log(last, list[i + 1].date)
            if (list[i + 1].date == last) {
                con++
            } else {
                break
            }
        }
    }
    return con
}
/**
 * 查询累计打卡天数
 * @param {*} task_id 计划id
 */
async function task_query_sum(task_id, user_id) {
    let sql = `select count(distinct date) as sum from record where task_id = ${task_id} and user_id = ${user_id}`
    let sum = await utils.executeSQL(sql)
    sum = sum && JSON.parse(sum)
    return sum[0].sum
}
/**
 * 查询某一天已打卡成员的头像
 * @param {*} task_id 计划id
 * @param {*} date 查询的日期
 */
async function task_select_over_urlList(task_id, date) {
    let sql = `select distinct user.avatarUrl as url from record,user where record.date = '${date}' and record.task_id = ${task_id} and record.user_id = user.id`
    let list = await utils.executeSQL(sql)
    return list
}
/**
 * 查询当天用户有没有打过卡
 * @param {*} task_id 计划id
 * @param {*} user_id 用户id
 */
async function task_query_today(task_id, user_id) {
    let date = utils.getCurrentFormatedDate()
    let sql = `select count(*) as count from record where task_id = ${task_id} and user_id = ${user_id} and date = '${date}'`
    let count = await utils.executeSQL(sql)
    if (count == '[]') return 0
    else {
        count = count && JSON.parse(count)
        count = count[0].count
        if (count == 0) {
            return 0
        } else {
            return 1
        }
    }
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
 * 新成员入圈
 * @param {*} user_id 用户id
 * @param {*} flock_id 小组id
 * @param {*} nickName  昵称 
 */
async function joining_insert(user_id, flock_id, nickName) {
    let sql = `insert into joining(user_id,flock_id,nickName) values(${user_id},${flock_id},'${nickName}')`
    await utils.executeSQL(sql)
    return true
}
/**
 * 查询某个用户是否加入小组
 * @param {*} flock_id 小组id
 * @param {*} user_id 用户id
 */
async function joining_query(flock_id, user_id) {
    let sql = `select id as flag from joining where flock_id = ${flock_id} and user_id = ${user_id} limit 1`
    let flag = await utils.executeSQL(sql)
    if (flag == "[]") {
        return false
    } else {
        return true
    }
}
/**
 * 修改小组昵称
 * @param {*} nickName 修改后的昵称
 * @param {*} fid 小组id
 * @param {*} uid 用户id
 * @returns 
 */
async function joining_update_nickName_by_fid_uid(nickName, fid, uid) {
    let sql = `update joining set nickName = '${nickName}' where flock_id = ${fid} and user_id = ${uid}`
    await utils.executeSQL(sql)
    return true
}
/**
 * 查询小组昵称
 * @param {*} fid 小组id
 * @param {*} uid 用户id
 * @returns 
 */
async function joining_select_nickName_by_fid_uid(fid, uid) {
    let sql = `select nickName from joining where flock_id = ${fid} and user_id = ${uid}`
    let nickName = await utils.executeSQL(sql)
    if (nickName == "[]") {
        return '暂无';
    } else {
        nickName = nickName && JSON.parse(nickName);
        return nickName[0].nickName;
    }

}

/**
 * 获取所有打卡
 * @param {*} user_id 用户id
 */
async function record_select_limit_20(user_id) {
    let sql = `select record.*,user.avatarUrl,user.nickName,flock.name as fname,flock.id as fid ,task.id as tid,task.name as tname,exists(select id from joining where user_id = ${user_id} and flock_id = flock.id) as mine, exists(select id from recordlike where record_id = record.id and user_id = ${user_id} ) as isLike,(select count(*) from recordlike where record_id = record.id) as like_num,(select count(*) from remark where record_id = record.id) as remark_num  from record,user,flock,task where   record.task_id = task.id and  record.flock_id = flock.id and record.user_id = user.id order by record.date desc,record.time desc limit 20`
    let list = utils.executeSQL(sql)
    return list
}
/**
 * 获取指定起点的20条数据
 * @param {*} start 
 * @param {*} user_id 
 * @returns 
 */
async function record_select_more(user_id, start) {
    let sql = `select record.*,user.avatarUrl,user.nickName,flock.name as fname,flock.id as fid ,task.id as tid,task.name as tname, exists(select id from joining where user_id = ${user_id} and flock_id = flock.id) as mine,exists(select id from recordlike where record_id = record.id and user_id = ${user_id} ) as isLike, (select count(*) from recordlike where record_id = record.id) as like_num,(select count(*) from remark where record_id = record.id) as remark_num  from record,user,flock,task where   record.task_id = task.id and  record.flock_id = flock.id and record.user_id = user.id order by record.date desc,record.time desc limit ${start},20`
    let list = utils.executeSQL(sql)
    return list
}


/**
 * 查找记录的基本信息（携带是否点赞，点赞个数，评论个数）
 * @param {*} rid 记录id
 * @param {*} uid 
 */
async function record_select_by_id(rid, uid) {
    let sql = `select flock.name as fname,flock.id as fid,task.name as tname,task.id as tid,record.*,user.avatarUrl,user.nickName,exists(select id from recordlike where record_id = record.id and user_id = ${uid} ) as isLike,(select count(*) from recordlike where record_id = record.id) as like_num,(select count(*) from remark where record_id = record.id) as remark_num  from record,user,task,flock where record.task_id = task.id and record.flock_id = flock.id and record.id = ${rid} and record.user_id = user.id`
    let list = utils.executeSQL(sql)
    return list
}
/** 
 * 查询当前计划下的所有打卡信息(携带头像和昵称，是否点赞，点赞个数，评论个数)20条
 * @param {*} t_id 计划ID
 * @param {*} u_id 用户ID
 */
async function record_select_by_tid_limit_20(t_id, u_id) {
    let sql = `select record.*,user.avatarUrl,joining.nickName ,exists(select id from recordlike where record_id = record.id and user_id = ${u_id} ) as isLike,(select count(*) from recordlike where record_id = record.id) as like_num,(select count(*) from remark where record_id = record.id) as remark_num  from record,user,joining where joining.user_id = user.id and joining.flock_id = record.flock_id and record.task_id = ${t_id} and record.user_id = user.id order by record.date desc,record.time desc limit 20`
    let list = utils.executeSQL(sql)
    return list
}
/** 
 * 查询当前计划下的所有打卡信息(携带头像和昵称，是否点赞，点赞个数，评论个数)从当前位置开始再读20条
 * @param {*} t_id 计划ID
 * @param {*} u_id 用户ID
 * @param {*} nlength 当前的长度
 */
async function record_select_by_tid_more(t_id, u_id, nlength) {
    let sql = `select record.*,user.avatarUrl,joining.nickName ,exists(select id from recordlike where record_id = record.id and user_id = ${u_id} ) as isLike,(select count(*) from recordlike where record_id = record.id) as like_num,(select count(*) from remark where record_id = record.id) as remark_num  from record,user,joining where joining.user_id = user.id and joining.flock_id = record.flock_id and record.task_id = ${t_id} and record.user_id = user.id order by record.date desc,record.time desc limit ${nlength},20`
    let list = utils.executeSQL(sql)
    return list

}
/**
 * 插入一条打卡记录
 * @param {*} id id  
 * @param {*} fid 圈子id
 * @param {*} tid 计划id
 * @param {*} uid 用户id
 * @param {*} date 日期
 * @param {*} time 时间
 * @param {*} content 内容  
 * @param {*} url 图片链接
 * @param {*} duration 持续时间
 */
async function record_insert(id, fid, tid, uid, date, time, content, url, duration) {
    let sql = `insert into record values(${id},${fid},${tid},${uid},'${date}','${time}','${content}','${url}',0,'${duration}')`
    await utils.executeSQL(sql)
    return true
}
/**
 * 给打卡点赞
 * @param {*} rid 打卡记录id
 * @param {*} uid 用户id
 * @returns 
 */
async function record_like(rid, uid) {
    let sql = `update record set like_num = like_num + 1 where id = ${rid}`
    let sql1 = `insert recordlike(record_id,user_id) values(${rid},${uid})`
    await utils.executeSQL(sql)
    await utils.executeSQL(sql1)
    return true
}
/**
 * 给打卡取消点赞
 * @param {*} rid 打卡记录id
 * @param {*} uid 用户id
 * @returns 
 */
async function record_cancel_like(rid, uid) {
    let sql = `update record set like_num = like_num - 1 where id = ${rid}`
    let sql1 = `delete from recordlike where record_id  = ${rid} and user_id = ${uid}`
    await utils.executeSQL(sql)
    await utils.executeSQL(sql1)
    return true
}
/**
 * 删除记录
 * @param {*} rid 记录Id
 * @returns 
 */
async function record_delete(rid) {
    let sql = `delete from record where id = ${rid}`
    await utils.executeSQL(sql)
    return true
}
/**
 * 获取当前帖子下所有评论，包含点赞
 * @param {*} record_id 帖子ID
 * @param {*} user_id 当前用户ID
 */
async function remark_select(record_id, user_id) {
    let sql = `select remark.*,user.nickName,user.avatarUrl,exists (select id from remarklike where user_id =${user_id} and remark_id = remark.id) as isLike,(remark.user_id = ${user_id}) as admin,(select count(*) from remarklike where remark_id = remark.id) as like_num  from remark,user where remark.record_id = ${record_id} and user.id = remark.user_id order by remark.time desc;`
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
async function log_select() {
    let sql = `select * from updateLog order by date`;
    return await utils.executeSQL(sql);
}
async function log_insert(id, content, date) {
    let sql = `insert into updateLog values(${id},'${content}','${date}')`;
    await utils.executeSQL(sql);
    return true;
}
async function log_remove(id) {
    let sql = `delete from updateLog where id = ${id}`;
    await utils.executeSQL(sql);
    return true;
}
module.exports = {
    accomplish_insert,
    accomplish_update_grade,
    accomplish_delete,
    accomplish_select,
    flock_update,
    flock_insert,
    flock_update_notice,
    flock_quit,
    flock_select_by_id,
    flock_select_all,
    flock_select_count_by_uid,
    flock_select_member,
    flock_select_member_expect_creater,
    flock_select_amdin,
    flock_select_notice,
    flock_select_order_by_value,
    flock_check_admin,
    flock_check_member,
    flock_delete,
    flock_select_by_type,
    flock_select_recommandList,
    flock_select_fid_by_tid,
    flock_search,
    message_exists_id,
    message_select_by_id,
    message_select_id,
    message_count_of_id_hasRead,
    message_insert,
    message_delete_by_id,
    message_read,
    message_update_state,
    message_check_hasSend_and_state,
    message_update_date_hasRead_by_id_type,
    user_select_by_id,
    task_select_by_fid_uid,
    task_select_by_uid_and_over,
    task_insert,
    task_member_num,
    task_update,
    task_update_2,
    task_charts_message,
    task_time_line_day,
    task_time_line_week,
    task_quit,
    task_delete,
    task_select_member,
    task_select_member_expect_creator,
    task_select_amdin,
    task_check_amdin,
    task_select_by_id,
    task_select_flock,
    task_query_continuous,
    task_query_sum,
    task_select_over_urlList,
    task_select_name_by_tid,
    task_query_today,
    participate_insert,
    joining_insert,
    joining_query,
    joining_update_nickName_by_fid_uid,
    joining_select_nickName_by_fid_uid,
    record_select_limit_20,
    record_select_more,
    record_select_by_id,
    record_select_by_tid_limit_20,
    record_select_by_tid_more,
    record_insert,
    record_like,
    record_cancel_like,
    record_delete,
    remark_select,
    remark_delete,
    remark_insert,
    remark_like,
    remark_cancel_like,
    user_insert,
    user_select_task_uncover_day,
    user_select_task_uncover_week,
    user_select_task_cover_day,
    user_select_task_cover_week,
    user_select_openid_by_uid,
    user_select_id_by_openid,
    user_select_name_by_id,
    poter_select,
    log_select,
    log_insert,
    log_remove,
}