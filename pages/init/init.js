const util = require('../../utils/util')
const SQL = require('../../utils/sql')
const isTel = (value) => !/^1[34578]\d{9}$/.test(value)
const app = getApp()
Page({
  navi_to_flock: async function () {
    let [id,creater_id,name,state,avatarUrl,type ] = [util.randomsForSixDigit(),app.globalData.user_id,this.data.valueOfName, this.data.valueOfState,'https://pic4.zhimg.com/v2-a983007c6b9bbf2bf63dfb1c460a973f_r.jpg?source=1940ef5c', this.data.type ]
    //判空
    if (name == "" || state == "" || type == "") {
      util.show_toast('还未输入数据', 'fobidden')
      return
    }
    await SQL.flock_insert(id,creater_id,name,state,avatarUrl,type)
    util.show_toast("创建成功,即将前往圈子主页")
    setTimeout(() => {
      wx.navigateTo({
        url: '../flock/flock?id=' + id,
      })
    }, 1000);

  },
  /**
   * 选择类别
   */
  typeChange: function (e) {
    this.setData({
      type: this.data.typeArray[e.detail.value]
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
    valueOfName: "",
    valueOfState: "",
    type: "",
    typeArray: ['班级', '宿舍', '伙伴', '社团', '组织']
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