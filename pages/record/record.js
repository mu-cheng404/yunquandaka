const util = require("../../utils/util")
let V = {
  id: "",
}
const app = getApp()
Page({
  toOptions:function() {
    wx.navigateTo({
      url: '../targetOption/targetOption?id='+V.id,
    })
  },
  uploadImage: async function (tempUrl) {
    const date = util.formatTime(new Date())
    await wx.cloud.uploadFile({
      cloudPath: V.user_id + " userImage/" + date,
      filePath: tempUrl,
    }).then(res => {
      let fileID = res.fileID
      this.setData({
        fileID: fileID
      })
    })
  },
  chooseImage: async function () {
    await wx.chooseImage({
      count: 1,
    }).then(async (res) => {
      let tempUrl = res.tempFilePaths[0]
      this.setData({
        tempFilePath: tempUrl
      })
      await this.uploadImage(tempUrl)
    })
  },
  typeChange: function (e) {
    const {
      value
    } = e.detail
    this.setData({
      type: value
    })
  },
  _contentInput: function (e) {
    let value = e.detail.value;
    this.setData({
      content: value
    })
  },
  submit: async function () {
    let type = this.data.type
    let [id, task_id, content, date, time, url] = [util.randomsForSixDigit(), V.id, this.data.content, util.formatTime(new Date()).slice(0, 10), util.formatTime(new Date()).slice(11, 19), '']
    if (type == "文字") {
      url = ""
    } else if (type == "图片") {
      url = this.data.fileID
      content = ""
    }else {
      url = "",
      content=this.data.info.defaultText
    }
    let sql1 = `insert into record values(${id},${task_id},'${content}','${date}','${time}','${url}')`
    let sql2 = `insert into punch (user_id,record_id) values(${app.globalData.user_id},${id})`
    await util.executeSQL(sql1)
    await util.executeSQL(sql2)
    //提示
    wx.showToast({
      title: '打卡成功',
    })
    //跳转回去
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    type: "文字",
    fileID: "",
    info: {},
    content: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    V.id = options.id
    let sql = `select * from task where id=${V.id}`
    await wx.cloud.callFunction({
      name: "mysql",
      data: {
        sql: sql
      }
    }).then((res) => {
      let result = res.result[0]
      console.log(result)
      this.setData({
        info: result
      })
    })
  },

})