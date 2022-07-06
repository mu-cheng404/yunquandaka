const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  handleInput(e){
    let content = e.detail.value;
    this.setData({
      content
    })
  },
  async submit(){
    let [id,content,date] = [utils.randomsForSixDigit(),this.data.content,utils.getCurrentFormatedDate()];
    if(!content){
      utils.show_toast("内容为空","forbidden");
    }
    await SQL.log_insert(id,content,date);
    utils.show_toast('提交成功');
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})