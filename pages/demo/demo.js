var test = 1;
const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
const message = require("../../utils/message")
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    avatarList: ["../../images/avatar.jpg", "../../images/avatar.jpg", "../../images/avatar.jpg", "../../images/avatar.jpg", "../../images/avatar.jpg", ]
  },
  execute:async function(){
    let sql = `delete from flock where creater_id = 579718`
    await utils.executeSQL(sql)
  },
  consoleH: function (params) {
    console.log("Hello world")
  },
  /**
   * 获取订阅授权
   */
  getAccess: function (params) {
    wx.requestSubscribeMessage({

      tmplIds: ['V1M7ZJ09GIic3WyzkpRNU3XuXHaM-ORxs59YDGcPeSI', 'XfpLvF_QtFsXoKcVz7sgMovDkTTW8wHhOa5mbwdiTTs', 'MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI'],

      success(res) {
        console.log(res)
      },
      fail(res) {
        console.log("失败！")
        console.log(res)
      }
    })
  },
  sendMessage: async function () {

    let type = 3;
    let openid = "oBWNP424KaLqulEo0tY6Yyg61zCc"
    let data = {
      "thing4": { //名称
        "value": "124"
      },
      "thing5": { //备注
        "value": "你还没打卡哦"
      },
      "phrase3": { //状态
        "value": "未打卡"
      },
      "time2": { //时间
        "value": "03.19"
      },
    }
    await wx.cloud.callFunction({
      name: "sendSubscribeMessage",
      data: {
        data: JSON.stringify(data),
        type: type,
        openid: openid
      }
    }).then((res) => {
      console.log("发送订阅消息的结果是")
      console.log(res)
    })

  },
  trigger: async function () {
    await wx.cloud.callFunction({
      name: "trigger"
    }).then(res => {
      console.log(res)
    })
  },
  getCurrentFormatedDate:function(){
    let date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${[year, month, day].map(this.formatNumber).join('-')}`
  },
  formatNumber:function(n){
    n = n.toString()
    return n[1] ? n : `0${n}`
  },
  dailyCheck: async function () {
    await wx.cloud.callFunction({
      name: "dailyCheck"
    }).then(res => {
      console.log(res)
    })
    // let date = this.getCurrentFormatedDate()
    // console.log(date)
    // //选择每个任务
    // let sql = `update task set isEnd=1 where end<'${date}' and isEnd=0`;
    // await wx.cloud.callFunction({
    //   name: "mysql",
    //   data: {
    //     sql: sql
    //   }
    // }).then(async res => {
    //   let [time,content,user] = [new Date().toLocaleString(),JSON.stringify(res.result),"task"]
    //   let sql1 = `insert into log(time,content,user) values('${time}','${content}','${user}')`
    //   await wx.cloud.callFunction({
    //     name: "mysql",
    //     data: {
    //       sql:sql1
    //     }
    //   })
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    await wx.cloud.callFunction({
      name: "trigger"
    }).then((res) => {
      console.log(res.result)
    })
    let myOldDate = new Date("Tue Mar 22 2022 04:53:01 GMT+0000")
    //期待变成 Tue Mar 22 2022 12:53:01 GMT+0800
    let p1 = Date.parse(myOldDate)
    console.log("Tue Mar 22 2022 04:53:01 GMT+0000的时间戳=" + p1)
    let forward = "Tue Mar 22 2022 12:53:01 GMT+0800"
    let p2 = Date.parse(forward)
    console.log("Tue Mar 22 2022 12:53:01 GMT+0800的时间戳=" + p2)
    //开始转变
    console.log("中国时区的时差为=" + new Date().getTimezoneOffset())
    let p3 = myOldDate.getTime() + (60000 * (480));
    console.log("旧的时间戳为=" + p1)
    console.log("新的时间戳为=" + p3);
    let myNewDate = new Date(p3)
    console.log("新的时间为=" + myNewDate)

    //14:12:09 GMT+0000 (Coordinated Universal Time)
    //22:14:24 GMT+0800 (中国标准时间)
    // let hour = "09";
    // console.log(hour-16)
    // if (hour < 16) {
    //   hour = hour.slice(1,2)
    //   hour = parseInt(hour) + 8
    //   hour = "0"+hour
    // }else{
    //   hour = hour -16;
    //   hour = "0"+hour
    // }
    // console.log(hour)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})