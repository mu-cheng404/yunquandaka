const utils = require("../../utils/util")
const SQL = require("../../utils/sql")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    
    let logList = await SQL.log_select();
    logList = logList && JSON.parse(logList);

    const myDate = new utils.myDate();
    let current = utils.getCurrentFormatedDate();
    logList.forEach((value,index) => {
      let tag = myDate.getDiffYmdBetweenDate(value.date, current);
      if (tag.y > 0) {
        logList[index].date = tag.y + "年前";
      } else if (tag.m > 0) {
        logList[index].date = tag.m + "月前";
      } else if (tag.d > 0) {
        logList[index].date = tag.d + '天前';
      } else{
        logList[index].date = "今天"
      }
    })
    this.setData({
      logList,
      identify: app.globalData.user_id != '383343',
    })
  },
  async handleRemove(e){
    let id = e.currentTarget.id;
    wx.showModal({
      title:"提示",
      content:"确定删除",
      success:async res=>{
        if(res.confirm){
          await SQL.log_remove(id);
          utils.show_toast("删除成功");
        }
        await this.onLoad()
      }
    })
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