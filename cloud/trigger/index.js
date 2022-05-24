// 云函数入口文件 
const cloud = require('wx-server-sdk')

cloud.init()
const week = ['周一', '周二', '周三', '周四', '周五', '周六', '周天']
// 云函数入口函数 

exports.main = async (event, context) => {
  //当前时间 
  let myDate = new Date(Date.parse(new Date()) + 60000 * 480)
  let time = myDate.toTimeString().slice(0, 5)
  let [hour, minute] = [myDate.getHours(), myDate.getMinutes()]
  if (hour < 16) {
    hour = hour + 8
  } else {
    hour = hour - 24;
  }

  const weekday = week[myDate.getDay() - 1]
  let end = []
  let end_log = []
  //数据库里检查所有满足条件的target,所有还没有结束的target都需要检查是否需要提醒 
  
  let sql = `select u.openid,t.id,t.flock_id,t.name,t.cycle,t.weekday,t.clock from task as t,joining as j,user as u where t.isEnd = 0 and t.flock_id = j.flock_id and j.user_id = u.id`
  console.log(sql)
  let result
  await cloud.callFunction({
    name: "mysql",
    data: {
      sql: sql
    }
  }).then((res) => {
    result = res.result
  })
  // 比较时间 
  for (let i = 0; i < result.length; i++) {
    if ((result[i].cycle == "每周" && result[i].weekday == weekday) || result[i].cycle == "每天") {
      if (result[i].clock == time) { //当前时间等于提醒时间 
        //整合数据 
        let type = 3;
        let openid = result[i].openid
        let data = {
          "thing4": { //名称 
            "value": result[i].name
          },
          "thing5": { //备注 
            "value": "你还没打卡哦"
          },
          "phrase3": { //状态 
            "value": "未打卡"
          },
          "time2": { //时间 
            "value": time
          },
        }
        console.log("data=")
        console.log(data)
        //调用云函数发送通知 
        await cloud.callFunction({
          name: "sendSubscribeMessage",
          data: {
            data: JSON.stringify(data),
            type: type,
            openid: openid,
            flock_id: result[i].flock_id
          }
        }).then(async (res) => {
          end[i] = res.result
          let [time, content,user] = [new Date().toLocaleString(), JSON.stringify(res.result),result[i].openid]
          let sql = `insert into log(time, content,user) values('${time}','${content}','${user}')`
          await cloud.callFunction({
            name: "mysql",
            data: {
              sql: sql
            }
          }).then(res => {
          })
        })
      }
    }
  }

  return {
    end: end,
    result: result,
    time: time,
    weekday: weekday,
  }
}