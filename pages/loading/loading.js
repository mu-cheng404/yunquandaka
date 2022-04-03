const globalData = getApp().globalData
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    await this.init()
  },
  init: async function () {
    let loginFlag = 1,
      subscribeFlag = 1
    await wx.getSetting({
      withSubscriptions: true,
    }).then(res => {
      //检查信息授权

      console.log(JSON.stringify(res.authSetting).slice(18, 22))
      if (JSON.stringify(res.authSetting).slice(18, 22) != "true") {
        loginFlag = 0
      }
      //检查订阅授权
      let list = res.subscriptionsSetting.itemSettings
      let refer = {
        "XfpLvF_QtFsXoKcVz7sgMovDkTTW8wHhOa5mbwdiTTs": "accept",
        "MJnrsOf3OJsBjZZ2E6yqz86sBR7_VgTQE4lGQ8eHwDI": "accept",
        "V1M7ZJ09GIic3WyzkpRNU3XuXHaM-ORxs59YDGcPeSI": "accept"
      }
      if (JSON.stringify(refer) != JSON.stringify(list)) {
        subscribeFlag = 0;
      }
    })
    if (loginFlag && !subscribeFlag) {
      await this.getUserId()
      wx.navigateTo({
        url: `../authorize/authorize?loginFlag=${loginFlag}&&subscribeFlag=${subscribeFlag}`,
      })
    } else if (loginFlag && subscribeFlag) {
      await this.getUserId()
      console.log("用户已经授权信息 订阅 id=" + globalData.user_id)
      wx.switchTab({  
        url: '../home/home',
      })
    } else {
      wx.navigateTo({
        url: `../authorize/authorize?loginFlag=${loginFlag}&&subscribeFlag=${subscribeFlag}`,
      })
    }

  },
  getUserId: async function () {
    let openid = await wx.cloud.callFunction({
      name: "getOpenID"
    })
    openid = openid.result.openid
    let sql = `select id from user where openid='${openid}'`
    await wx.cloud.callFunction({
      name: "mysql",
      data: {
        sql: sql
      }
    }).then(res => {
      globalData.user_id = res.result[0].id
      globalData.hasUserInfo = "true"
    })
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