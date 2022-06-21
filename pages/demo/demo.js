var test = 1;
const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
const message = require("../../utils/message")
const wxCharts = require("../../utils/wxcharts.js"); //相对路径

Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarList: ["../../images/avatar.jpg", "../../images/avatar.jpg", "../../images/avatar.jpg", "../../images/avatar.jpg", "../../images/avatar.jpg", ],
    height: 0
  },
  onLoad: async function (options) {
   
  },
  async testAPI(){
    let res = await wx.cloud.callFunction({
      name: "mediaCheck",
    })
    console.log(res)
  },

  execute: async function () {
    // let res = await wx.showModal({

    // })
    // console.log(res)
    // console.log("我最牛")
    // wx.requestSubscribeMessage({
    //   tmplIds: [
    //     "MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI"
    //   ],
    //   success: res => {
    //     console.log(res)
    //   },
    //   fail: res => {
    //     console.log(res)
    //   }
    // })
    // let subFlag = await utils.verifySubscription()
    // if (!subFlag) {
    //   wx.requestSubscribeMessage({
    //     tmplIds: [
    //       "MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI"
    //     ],
    //     success: res => {
    //       console.log(res)
    //     },
    //     fail: res => {
    //       console.log(res)
    //     }
    //   })
    // } else {
    //   console.log("订阅成功")
    // }
    // let arr = [1,2,4,5,6]
    // console.log(arr)
    // arr.push(9)
    // console.log(arr)

    // let sql = `update flock set avatarUrl = 'http://ccreblog.cn/wp-content/uploads/2022/06/白底反黑图.png' where avatarUrl = 'https://pic4.zhimg.com/v2-a983007c6b9bbf2bf63dfb1c460a973f_r.jpg?source=1940ef5c'`

    // let sql= `update joining set nickName = (select nickName from user where id = joining.user_id) where nickName is NULL`
    // await utils.executeSQL(sql)
    // let sql= `update task set cycle = '日' where cycle = '每天' or cycle = '每周'`
    // await utils.executeSQL(sql)
    // 测试时间
    let myDate = new utils.myDate()

    let date = new Date("2022-6-13")
    let locate = myDate.locateWeek(date)
    console.log(locate.start)
    console.log(locate.end)

    // 测试page
    // let page = getCurrentPages()
    // console.log(page)
    // console.log(page[0].route)

  },
  async sub() {
    let res = await utils.popupSubscription()
    console.log(res)
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
  getCurrentFormatedDate: function () {
    let date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${[year, month, day].map(this.formatNumber).join('-')}`
  },
  formatNumber: function (n) {
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
    let {
      windowHeight,
      windowWidth
    } = await wx.getSystemInfo()
    console.log(windowHeight, windowWidth)
  },

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