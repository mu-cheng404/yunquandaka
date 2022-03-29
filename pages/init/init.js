const util = require('../../utils/util')
const isTel = (value) => !/^1[34578]\d{9}$/.test(value)
const DB = wx.cloud.database()
const _flock = DB.collection("flock") //打卡表
const app = getApp()
Page({
  navi_to_flock: async function () {
    let [name, state, id] = [this.data.valueOfName, this.data.valueOfState, util.randomsForSixDigit()]
    //判空
    if (name != "" && state != "")  {
      let sql1 = `insert into flock values(${id},'${name}','${state}')`
      await util.executeSQL(sql1)
      let user_id = app.globalData.user_id
      let sql2 = `insert into joining(user_id,flock_id) values(${user_id},${id})`
      await util.executeSQL(sql2)
      wx.navigateTo({
        url: '../flock/flock?id=' + id,
      })
    }else{
      wx.showToast({
        title: '还未输入信息',
        icon:"none"
      })
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    valueOfName: "",
    valueOfState: "",
  },

  // 输入框
  onChangeOfNameInput(e) {
    this.setData({
      valueOfName: e.detail.value,
    })
  },
  onChangeOfStateInput(e) {
    this.setData({
      valueOfState: e.detail.value,
    })
  },
  onFocus(e) {
    this.setData({
      error: isTel(e.detail.value),
    })
    console.log('onFocus', e)
  },
  onBlur(e) {
    this.setData({
      error: isTel(e.detail.value),
    })
    console.log('onBlur', e)
  },
  onConfirm(e) {
    console.log('onConfirm', e)
  },
  onClear(e) {
    console.log('onClear', e)
    this.setData({
      error: true,
      value: '',
    })
  },
  onError() {
    wx.showModal({
      title: 'Please enter 11 digits',
      showCancel: !1,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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