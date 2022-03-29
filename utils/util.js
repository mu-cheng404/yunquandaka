const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}
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

function getDiffBetweenDate(sDate1, sDate2) {
  var stime = Date.parse(new Date(sDate1));
  var etime = Date.parse(new Date(sDate2));
  var usedTime = etime - stime;
  var days = Math.floor(usedTime / (24 * 3600 * 1000));
  return days
}
/**
 * 连接mysql,执行sql语句
 * 输入：sql
 * 输出： result
 */
async function executeSQL(sql) {
  let result
  await wx.cloud.callFunction({
    name: "mysql",
    data: {
      sql: sql
    }
  }).then((res) => {
    result = JSON.stringify(res.result)
    if (!result) {
      console.log("本次查找结果为空")
    } else {
      console.log("\n执行" + sql + "的结果为：")
      console.log(result)
      console.log("\n")
    }
  })

  return result

}
/**
 * 判断时间前后
 * 输出：1 mean 前者前 0 mean 前者后
 */
function compareTime(time1, time2) {
  let hour1 = time1.slice(0, 2)
  let hour2 = time2.slice(0, 2)
  let minute1 = time1.slice(3, 5)
  let minute2 = time2.slice(3, 5)
  if (hour1 < hour2) {
    return 1
  } else if (hour1 > hour2) {
    return 0
  } else {
    if (minute1 < minute2) {
      return 1
    } else {
      return 0
    }
  }
}
module.exports = {
  formatTime,
  randomsForSixDigit,
  executeSQL,
  getCurrentFormatedDate,
  getDiffBetweenDate,
  compareTime
}