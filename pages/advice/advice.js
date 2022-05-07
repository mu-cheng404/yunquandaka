const utils = require("../../utils/util")
Page({
  messageInput: function (e) {
    let value = e.detail.value
    this.setData({
      message: value
    })
  },
  contactInput: function (e) {
    let value = e.detail.value
    this.setData({
      contact: value
    })
  },
  contactTypeSelect: function (e) {
    let value = e.detail.value
    this.setData({
      contactType: value
    })
  },
  submit: async function (e) {
    let data = {
      contact: this.data.contact,
      message: this.data.message,
      contactType: this.data.contactType
    }
    if (data.contact.length != 0 && data.message.length != 0) {
      let res = await wx.cloud.callFunction({
        name: "sendEmail",
        data: {
          data: data
        }
      })
      console.log(res)
    } else if (data.contact.length == 0) {
      $wuxToast().show({
        type: 'text',
        duration: 1500,
        color: '#fff',
        text: '还没输入意见',
        success: () => console.log('文本提示'),
      })
    } else if (data.message.length == 0){
      $wuxToast().show({
        type: 'text',
        duration: 1500,
        color: '#fff',
        text: '还没输入联系方式',
        success: () => console.log('文本提示'),
      })
    }
    utils.show_toast('感谢您提出宝贵的意见，我们会更加努力！！！')
  },
  /**
   * 页面的初始数据
   */
  data: {
    message: "",
    contact: "",
    contactType: ""
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