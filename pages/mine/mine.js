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
    let result = await SQL.user_select_by_id(globalData.user_id);
    result = result && JSON.parse(result)
    this.setData({
      userInfo: result[0]
    })
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
   * 退出登录
   */
  async HandleQuitLogin() {
    wx.setStorageSync('login', 2)
    wx.navigateTo({
      url: '../authorize/authorize?state=2',
    }) //跳转到登录页
  },
  async openauthority() {
    if (await utils.verifySubscription()) {
      utils.show_toast("您已订阅")
      return
    }
    wx.showModal({
      title: "订阅提示",
      content: "为了避免订阅框多次弹出，建议勾选“不在提醒”",
      showCancel: false,
      success: async res => {
        let flag = await utils.popupSubscription()
        if (flag) {
          utils.show_toast("订阅成功！")
        } else {
          utils.show_toast("订阅失败，提供意见反馈给我们")
        }
      },
      fail: res => {
        utils.show_toast('出错了')
        console.log(res)
      }
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
  async onShow() {
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