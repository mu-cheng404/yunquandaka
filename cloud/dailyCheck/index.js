// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

/**
 * 获取当前格式日期
 * para null
 * return 2022-04-03
 */
const getCurrentFormatedDate = n => {
  let date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[year, month, day].map(formatNumber).join('-')}`
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
// 云函数入口函数
exports.main = async (event, context) => {
  let date = getCurrentFormatedDate()
  console.log(date)
  //选择每个任务
  let sql = `update task set isEnd=1 where end<'${date}' and isEnd=0`;
  await cloud.callFunction({
    name: "mysql",
    data: {
      sql: sql
    }
  }).then(async res => {
    let [time,content,user] = [new Date().toLocaleString(),JSON.stringify(res.result),"task"]
    let sql1 = `insert into log(time,content,user) values('${time}','${content}','${user}')`
    await cloud.callFunction({
      name: "mysql",
      data: {
        sql:sql1
      }
    })
  })

}