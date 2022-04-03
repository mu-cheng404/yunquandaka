// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let date = utils.getCurrentFormatedDate()
  console.log(date)
  //选择每个任务
  let sql = `update task set isEnd=1 where end<'${date}' and isEnd=0`;
  await cloud.callFunction({
    name: "mysql",
    data: {
      sql: sql
    }
  }).then(res => {
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