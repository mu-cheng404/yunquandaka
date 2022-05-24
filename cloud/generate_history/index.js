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

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let current = getCurrentFormatedDate()
  //每天检查是否有任务已经截止
  let sql_select = `select * from task where end = ${current}`

  let endTaskList = []//今天截止的计划列表
  await cloud.callFunction({
    name:'mysql',
    data:{
      sql:sql_select
    }
  }).then(res=>{endTaskList = res.result})
  
  let sql = `update task set isEnd = 1 where end = ${current}`//更新isEnd
  await cloud.callFunction({
    name:'mysql',
    data:{
      sql:sql
    }
  }).then()

  //截止了就设置isend为1

  //并且生成一条记录

  //生成一条log
  return {
    current:current,
    endTaskList:endTaskList
  }
}