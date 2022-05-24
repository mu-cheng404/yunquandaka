// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
const getCurrentFormatedDate = n => {
  let date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[year, month, day].map(formatNumber).join('-')}`
}
/**
 * 生成六位随机ID（暂时不考虑重复）
 */
function randomsForSixDigit() {
  let id
  do {
    id = Math.floor(Math.random() * 1000000)
  } while (id < 100000)

  return id
}
/**
 * 返回二者时间差
 * @param {*} sDate1 前一个时间
 * @param {*} sDate2 后一个时间
 */
function getDiffBetweenDate(sDate1, sDate2) {
  var stime = Date.parse(new Date(sDate1));
  var etime = Date.parse(new Date(sDate2));
  var usedTime = etime - stime;
  var days = Math.floor(usedTime / (24 * 3600 * 1000));
  return days
}
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let accId = []
  let current = getCurrentFormatedDate()
  //每天检查是否有任务已经截止
  let sql_select = `select * from task where end = ${current}`

  let endTaskList = [] //今天截止的计划列表
  await cloud.callFunction({
    name: 'mysql',
    data: {
      sql: sql_select
    }
  }).then(res => {
    endTaskList = res.result
  })

  //截止了就设置isend为1
  let sql = `update task set isEnd = 1 where end = ${current}` //更新isEnd
  await cloud.callFunction({
    name: 'mysql',
    data: {
      sql: sql
    }
  }).then()

  //并且为每个生成一条记录
  for (let i = 0; i < endTaskList.length; i++) { //遍历每个到期的计划
    let sql2 = `select user_id from joining where flock_id = ${endTaskList[i].flock_id} `
    let userList = [] //每个计划中的所有用户
    await cloud.callFunction({
      name: 'mysql',
      data: {
        sql: sql2
      }
    }).then(res => {
      userList = res.result
    })
    for (let j = 0; j < userList.length; j++) { //遍历每个用户，为他们制作记录
      let id, uid, tid, fid, duration, sum, rate, grade
      id = randomsForSixDigit()
      accId.push(id)
      uid = userList[j].user_id
      tid = endTaskList[i].id
      fid = endTaskList[i].flock_id
      duration = getDiffBetweenDate(endTaskList[i].start, endTaskList[i].end)
      rate = sum / duration
      grade = 0
      let sql3 = `select count(distinct date) as num from record where user_id = ${uid} and task_id = ${tid}`
      await cloud.callFunction({ //取得打卡总数
        name: 'mysql',
        data: {
          sql: sql3
        }
      }).then(res => {
        sum = res.result[0].sum
      })
      let sql4 = `insert into accomplish(id,user_id,task_id,flock_id,duration,sum,rate,grade) values(${id},${uid},${tid},${fid}},${duration},${sum},'${rate}',${grade})`
      await cloud.callFunction({
        name: 'mysql',
        data: {
          sql: sql4
        }
      }).then()
    }
  }
  //生成一条log
  if (endTaskList.length > 0) {
    let content = `在${current}天，有${endTaskList.length}个计划到期，为${accId.length}个用户制作了历史记录`
    let sql5 = `insert into log(time,content) values('${current}','${current}') `
  }
  return {
    current: current, //当前时间
    endTaskList: endTaskList, //找到的所有计划的id
    accId: accId, //生成的所有记录id
  }
}