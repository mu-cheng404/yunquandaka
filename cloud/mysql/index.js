
// 云函数入口文件
const cloud = require('wx-server-sdk')
//引入mysql操作模块
const mysql = require('mysql2/promise')
cloud.init()
 
// 云函数入口函数
exports.main = async (event, context) => {
  let sql = event.sql
  console.log("sql="+sql)
  const wxContext = cloud.getWXContext()
  try {
    const connection = await mysql.createConnection({
      host: "47.104.251.12",
      database: "wxapp",
      user: "wucc",
      password: "e103ec551df8bef8"
    })
    const [rows, fields] = await connection.query(sql)
    connection.end()
    return rows;
  } catch (err) {
    console.log("链接错误", err)
    return err
  }
  
  }