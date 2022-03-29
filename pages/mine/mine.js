// const { userInfo } = require("os")

// pages/mine/mine.js
let globalData = getApp().globalData
const utils = require("../../utils/util")

Page({
  /**
   * 同步微信形象
   */
  syncInfo: async function (e) {
    wx.getUserProfile({
      desc: '同步微信信息',
      success: (res) => {
        let newUserInfo = res.userInfo
        let sql =  `update user set nickName='${newUserInfo.nickName}',avatarUrl='${newUserInfo.avatarUrl}' where id = ${globalData.user_id}`

        utils.executeSQL(sql)

        this.onLoad()
      }
    })
  },
  
  toAboutus: function () {
    wx.navigateTo({
      url: '../aboutus/aboutus',
    })
  },
  toAccomplishment: function () {
    wx.navigateTo({
      url: '../accomplishment/accomplishment',
    })
  },
  toAdvice: function () {
    wx.navigateTo({
      url: '../advice/advice',
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    buttonDisplay: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {

    if (globalData.hasUserInfo) {
      let sql = `select * from user where id = ${globalData.user_id}`

      let result = await utils.executeSQL(sql)
      result = result && JSON.parse(result)

      this.setData({
        userInfo: result[0]
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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