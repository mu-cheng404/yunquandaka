let globalData = getApp().globalData
const utils = require("../../utils/util")
const SQL = require("../../utils/sql")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    buttonDisplay: "",
    hasUserInfo: false,
    message: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({
      hasUserInfo: globalData.hasUserInfo
    }) //从全局变量中获取flag
    if (this.data.hasUserInfo) {
      let sql = `select * from user where id = ${globalData.user_id}`
      let result = await utils.executeSQL(sql)
      result = result && JSON.parse(result)
      this.setData({
        userInfo: result[0]
      })
    }
    await this.check_message()
  },
  /**
   * 当用户已经登录时，同步微信形象的点击事件
   */
  syncInfo: async function (e) {
    wx.getUserProfile({
      desc: '同步微信信息',
      success: (res) => {
        let newUserInfo = res.userInfo
        let sql = `update user set nickName='${newUserInfo.nickName}',avatarUrl='${newUserInfo.avatarUrl}' where id = ${globalData.user_id}`
        utils.executeSQL(sql)
        this.onLoad()
      }
    })
  },
  /**
   * 当用户还没登录时，用户授权信息点击事件
   */
  getInfo: async function () {

    wx.getUserProfile({
      desc: '获取用户信息',
      success: async (res) => {
        //获取openID
        let userInfo = res.userInfo
        let openid = await wx.cloud.callFunction({
          name: "getOpenID",
        }).result.openid
        let sql = `insert into user values(${utils.randomsForSixDigit()},'${openid}','${userInfo.nickName}','${userInfo.avatarUrl}')`
        console.log(sql)
        utils.executeSQL(sql)
        //修改flag
        this.setData({
          hasUserInfo: true
        })
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
  
  async check_message() {
    this.setData({
      message: await SQL.message_count_of_id_hasRead(globalData.user_id)
    })
  },
  toAdmin: function () {
    wx.navigateTo({
      url: '../admin/admin',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow () {
    await this.check_message()
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