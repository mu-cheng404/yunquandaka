App({
  onLaunch: async function () {
    //云开发环境的初始化
    wx.cloud.init({
      env: "yuan-1-1gylic1ae84507a5"
    })
    
    await this.init()

  },

  globalData: {
    userInfo: null,
    user_id: "",
    hasUserInfo: false,
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

    if (loginFlag && subscribeFlag) {
      await this.getUserId()
      console.log("用户已经授权信息 订阅 id=" + this.globalData.user_id)
    } else {
      wx.navigateTo({
        url: `/pages/authorize/authorize?loginFlag=${loginFlag}&&subscribeFlag=${subscribeFlag}`,
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
      this.globalData.user_id = res.result[0].id
      this.globalData.hasUserInfo = "true"
    })
  },
})